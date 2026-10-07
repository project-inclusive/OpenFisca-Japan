"""
制度(Variable)とパラメータ(Parameter)のメタデータを抽出し、Jekyll用のデータファイルを生成する。

openfisca_japan のソースを自前でパースするのではなく、OpenFisca が構築した
TaxBenefitSystem から label / documentation / reference 等を読み出すため、
ソースコードと生成物が乖離しない。

使い方:
    python tools/make_docs/make_docs.py
    (リポジトリルートで `make docs` から呼ばれる)
"""

import argparse
import ast
from importlib import metadata
import json
import logging
import os
from pathlib import Path
import re

from openfisca_core.parameters import Parameter, ParameterNode
from openfisca_japan import CountryTaxBenefitSystem
import yaml

# このスクリプトから見たリポジトリルート (tools/make_docs/ の2つ上)
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = REPO_ROOT / "docs" / "_data"
# フロントエンドが見積もり結果に表示する制度の定義
APP_CONFIG_PATH = REPO_ROOT / "dashboard" / "src" / "config" / "app_config.json"
# app_config.json の見積もり結果のセクション -> 制度の種類
APP_CONFIG_KINDS = {"給付制度": "給付", "貸付制度": "貸付", "該当制度": "対象判定"}

# 生成物であることを明示するヘッダ (手で編集されるのを防ぐ)
GENERATED_HEADER = (
    "# このファイルは tools/make_docs/make_docs.py により自動生成されています。\n"
    "# 直接編集せず、`make docs` で再生成してください。\n"
)

# `# TODO: ...` 形式のコメント。TODO 直後の連続コメント行は補足として本文に取り込む
TODO_COMMENT_PATTERN = re.compile(r"^\s*#\s*TODO\s*[:：]?\s*(.*)$")
COMMENT_PATTERN = re.compile(r"^\s*#\s?(.*)$")
# documentation（docstring）内に書かれた TODO
TODO_TEXT_PATTERN = re.compile(r"^\s*TODO\s*[:：]?\s*(.*)$")

logger = logging.getLogger(__name__)


def to_repo_relative(path):
    """絶対パス・先頭スラッシュ付きパスをリポジトリルートからの相対パスに正規化する。"""
    if path is None:
        return None
    text = str(path)
    try:
        return str(Path(text).resolve().relative_to(REPO_ROOT))
    except ValueError:
        # インストール済みパッケージ側のパス等、リポジトリ外を指す場合は
        # openfisca_japan 以下だけを残す
        marker = "openfisca_japan"
        if marker in text:
            return text[text.index(marker):]
        return text.lstrip("/")


def split_category(relative_path, root_dir):
    """
    リポジトリ相対パスを (大分類, 中分類) に分解する。

    例:
      openfisca_japan/variables/福祉/育児/児童手当.py -> ("福祉", "育児/児童手当")
      openfisca_japan/variables/住民税.py             -> ("住民税", "")
    """
    prefix = f"openfisca_japan/{root_dir}/"
    if not relative_path or not relative_path.startswith(prefix):
        return ("その他", "")
    parts = relative_path[len(prefix):].split("/")
    stem = os.path.splitext(parts[-1])[0]
    if len(parts) == 1:
        return (stem, "")
    return (parts[0], "/".join(parts[1:-1] + [stem]))


def describe_value_type(variable):
    """Variable の値の型を表示用の文字列にする。"""
    if variable.value_type is None:
        return None
    name = getattr(variable.value_type, "__name__", str(variable.value_type))
    # bool/int/float/str/date はそのまま、Enum は候補値を別途出力する
    return name


def describe_default_value(variable):
    """Variable の既定値を YAML に載せられる素の値に変換する。"""
    default = variable.default_value
    if default is None:
        return None
    # Enum の既定値は `就労形態パターン.無` のようなメンバなので名前だけ取り出す
    if hasattr(default, "name") and hasattr(default, "value"):
        return default.name
    if isinstance(default, (bool, int, float, str)):
        return default
    return str(default)


def load_app_institutions(path, variable_names):
    """
    フロントエンドの見積もり結果に表示される制度を app_config.json から読み出す。

    戻り値は {Variable名: (制度の種類, 表示名, 説明)}。
    フロントエンドのみで判定している制度（対応する Variable が無いもの）は含めない。
    """
    if not path.exists():
        logger.warning("%s が見つからないため、制度の判定は命名規則のみで行います", path)
        return {}

    result_config = json.loads(path.read_text(encoding="utf-8"))["result"]
    institutions = {}

    def walk(kind, node):
        for name, info in node.get("制度一覧", {}).items():
            # 生活福祉資金貸付制度のように、制度の下にさらに制度一覧を持つ場合がある
            if "制度一覧" in info:
                walk(kind, info)
                continue
            # 結果に幅がある制度は `{制度名}_最大` / `{制度名}_最小` で計算している
            candidates = [info.get("variableName", name), f"{name}_最大", f"{name}_最小"]
            description = "\n".join(info.get("caption", [])) or None
            for candidate in candidates:
                if candidate in variable_names:
                    institutions[candidate] = (kind, name, description)

    for section, kind in APP_CONFIG_KINDS.items():
        section_config = result_config.get(section, {})
        walk(kind, section_config)
        for child in section_config.values():
            if isinstance(child, dict) and "制度一覧" in child:
                walk(kind, child)

    return institutions


def is_institution_output(variable, stem):
    """
    命名規則から、Variable が制度の最終結果（見積もり結果に出す値）かを判定する。

    フロントエンド未対応の制度も拾えるよう、開発ドキュメントの命名規則
    （制度名 = ファイル名、幅がある場合は `_最大` / `_最小`、対象判定は `の対象者がいる`）に従う。
    フロントエンドの制約上、制度の結果は世帯単位で計算している。
    """
    if not variable.formulas or variable.entity.key != "世帯":
        return False
    name = variable.name
    if name == f"{stem}の対象者がいる":
        return True
    # `ひとり親` のように、ファイル名と同名でも真偽値は世帯の属性であり制度ではない
    if name == stem:
        return describe_value_type(variable) != "bool"
    return re.fullmatch(rf"{re.escape(stem)}(_.+)?_(最大|最小)", name) is not None


def extract_source_todos(variables_dir, known_variable_names):
    """
    ソース中の `# TODO:` コメントを variables 配下の .py から抽出する。

    ast でクラスの行範囲を取得し、TODO 行を囲むクラス（= Variable）に紐付ける。
    どのクラスにも属さない TODO はファイル単位のものとして variable=None で返す。
    """
    todos = []
    for path in sorted(variables_dir.rglob("*.py")):
        source = path.read_text(encoding="utf-8")
        lines = source.split("\n")
        classes = [
            (node.lineno, node.end_lineno, node.name)
            for node in ast.walk(ast.parse(source))
            if isinstance(node, ast.ClassDef)
            ]

        index = 0
        while index < len(lines):
            matched = TODO_COMMENT_PATTERN.match(lines[index])
            if not matched:
                index += 1
                continue

            text = matched.group(1).strip()
            # 直後に続くコメント行は TODO の補足とみなして連結する
            cursor = index + 1
            while cursor < len(lines) and not TODO_COMMENT_PATTERN.match(lines[cursor]):
                comment = COMMENT_PATTERN.match(lines[cursor])
                if not comment:
                    break
                text = f"{text} {comment.group(1).strip()}".strip()
                cursor += 1

            # 最も内側のクラスに紐付ける（Variable でないクラスはファイル単位として扱う）
            owner = None
            for start, end, name in classes:
                if start <= index + 1 <= end and name in known_variable_names:
                    owner = name

            todos.append({
                "variable": owner,
                "text": text,
                "source": to_repo_relative(str(path)),
                "line": index + 1,
                })
            index = cursor

    return todos


def extract_documentation_todos(tax_benefit_system):
    """Variable の documentation に書かれた TODO を抽出する。"""
    todos = []
    for name, variable in tax_benefit_system.variables.items():
        for line in (variable.documentation or "").split("\n"):
            matched = TODO_TEXT_PATTERN.match(line)
            if matched:
                todos.append({
                    "variable": name,
                    "text": matched.group(1).strip(),
                    "source": to_repo_relative(
                        variable.introspection_data[0] if variable.introspection_data else None,
                        ),
                    "line": None,
                    })
    return todos


def build_variable_entries(tax_benefit_system, todos, app_institutions):
    """
    全 Variable を TaxBenefitSystem から読み出し、データファイル用の辞書のリストにする。

    各 Variable には役割（role）を付与する。
      - 制度: 制度の最終結果（見積もり結果に表示する値）
      - 計算項目: 制度の結果を求めるための中間的な計算値
      - 入力項目: formula を持たず、利用者が与える値
    制度の結果を1つでも含むファイルを「制度」とみなし、同じファイルの計算項目・入力項目は
    その制度に属する（institution）ものとして扱う。
    """
    todos_by_variable = {}
    for todo in todos:
        if todo["variable"]:
            todos_by_variable.setdefault(todo["variable"], []).append(todo)

    # 制度の結果を含むファイル -> 制度名（ファイル名）
    institution_sources = {}
    for name, variable in tax_benefit_system.variables.items():
        source = to_repo_relative(
            variable.introspection_data[0] if variable.introspection_data else None,
            )
        stem = os.path.splitext(os.path.basename(source or ""))[0]
        if name in app_institutions or is_institution_output(variable, stem):
            institution_sources[source] = stem

    entries = []
    for name, variable in tax_benefit_system.variables.items():
        source = to_repo_relative(
            variable.introspection_data[0] if variable.introspection_data else None,
            )
        category, subcategory = split_category(source, "variables")
        possible_values = getattr(variable, "possible_values", None)
        stem = os.path.splitext(os.path.basename(source or ""))[0]
        if name in app_institutions or is_institution_output(variable, stem):
            role = "制度"
        elif variable.formulas:
            role = "計算項目"
        else:
            role = "入力項目"

        entries.append({
            "name": name,
            "label": variable.label,
            "documentation": (variable.documentation or "").strip() or None,
            "references": list(variable.reference or []),
            "entity": variable.entity.key,
            "value_type": describe_value_type(variable),
            "possible_values": [member.name for member in possible_values] if possible_values else [],
            "definition_period": variable.definition_period.value,
            "default_value": describe_default_value(variable),
            "unit": variable.unit,
            # formula を持たない Variable は利用者に入力してもらう値
            "computed": bool(variable.formulas),
            "formula_start_dates": [str(key) for key in variable.formulas.keys()],
            # 制度の未実装・簡略化を示す TODO コメント
            "todos": [
                {"text": todo["text"], "line": todo["line"]}
                for todo in todos_by_variable.get(name, [])
                ],
            "role": role,
            "institution": institution_sources.get(source),
            "category": category,
            "subcategory": subcategory,
            "source": source,
            })

    # 生成物の差分を安定させるため並び順を固定する
    entries.sort(key=lambda entry: (entry["category"], entry["subcategory"], entry["name"]))
    return entries


def build_institution_entries(variable_entries, app_institutions):
    """制度一覧ページ用に、Variable を制度（= ファイル）単位にまとめたリストを作る。"""
    institutions = {}
    # 制度ごとの、フロントエンドでの表示名 -> 説明
    app_captions = {}
    for variable in variable_entries:
        name = variable["institution"]
        if not name:
            continue
        institution = institutions.setdefault(name, {
            "name": name,
            "kinds": [],
            "in_app": False,
            "description": None,
            "category": variable["category"],
            "subcategory": variable["subcategory"],
            "source": variable["source"],
            "outputs": [],
            "todo_count": 0,
            })
        institution["todo_count"] += len(variable["todos"])
        if variable["role"] != "制度":
            continue
        institution["outputs"].append(variable["name"])
        if variable["name"] in app_institutions:
            kind, display_name, description = app_institutions[variable["name"]]
            institution["in_app"] = True
            if kind not in institution["kinds"]:
                institution["kinds"].append(kind)
            app_captions.setdefault(name, {})[display_name] = description

    for name, captions in app_captions.items():
        # 生活福祉資金貸付制度のように1ファイルに複数の制度がある場合、
        # 個々の説明は制度全体の説明にならないため採用しない
        if len(captions) == 1:
            institutions[name]["description"] = next(iter(captions.values()))

    entries = list(institutions.values())
    entries.sort(key=lambda entry: (entry["category"], entry["subcategory"]))
    return entries


def format_number(number, unit):
    """パラメータの数値を表示用の文字列にする（桁区切り・単位付き）。"""
    if isinstance(number, bool):
        return "はい" if number else "いいえ"
    if not isinstance(number, (int, float)):
        return str(number)
    # YAML で `62.0` のように書かれた整数値は小数点を落とす
    if isinstance(number, float) and number.is_integer():
        number = int(number)
    text = f"{number:,}"
    # 税率など、円でない値に currency-JPY が付いているパラメータがあるため、
    # 円を付けるのは整数値のときだけにする
    if unit == "currency-JPY" and isinstance(number, int):
        return f"{text} 円"
    if unit == "人":
        return f"{text} 人"
    return text


def format_parameter_value(value, unit):
    """パラメータの値（配列を含む）を表示用の文字列にする。"""
    if value is None:
        # OpenFisca では値に null を設定すると、その日以降は適用されない（廃止）
        return "（適用なし）"
    if isinstance(value, list):
        return " / ".join(format_number(element, unit) for element in value)
    return format_number(value, unit)


def build_parameter_entries(parameter_node):
    """末端の Parameter を再帰的に集め、データファイル用の辞書のリストにする。"""
    entries = []

    def walk(node):
        for child in node.children.values():
            if isinstance(child, ParameterNode):
                walk(child)
            elif isinstance(child, Parameter):
                source = to_repo_relative(getattr(child, "file_path", None))
                category, subcategory = split_category(source, "parameters")
                metadata_dict = child.metadata or {}
                unit = metadata_dict.get("unit")
                # values_list は適用開始日の新しい順に並んでいる
                values = [
                    {
                        "date": str(value.instant_str),
                        "value": value.value,
                        "display": format_parameter_value(value.value, unit),
                        }
                    for value in child.values_list
                    ]
                entries.append({
                    "name": child.name,
                    "description": child.description,
                    "reference": metadata_dict.get("reference"),
                    "unit": unit,
                    # 一覧で目立たせる、適用開始日が最も新しい値
                    "latest": values[0] if values else None,
                    "values": values,
                    "category": category,
                    "subcategory": subcategory,
                    "source": source,
                    })
            # Scale(累進税率表)は現状 openfisca_japan では未使用のため対象外

    walk(parameter_node)
    entries.sort(key=lambda entry: entry["name"])
    return entries


def build_todo_entries(todos, variable_entries):
    """TODO 一覧ページ用に、Variable の分類・ラベルを付与した平坦なリストを作る。"""
    by_name = {entry["name"]: entry for entry in variable_entries}

    entries = []
    for todo in todos:
        variable = by_name.get(todo["variable"]) if todo["variable"] else None
        if variable:
            category = variable["category"]
            subcategory = variable["subcategory"]
        else:
            # どの Variable にも属さない TODO はファイルの位置から分類する
            category, subcategory = split_category(todo["source"], "variables")

        entries.append({
            "text": todo["text"],
            "variable": todo["variable"],
            "label": variable["label"] if variable else None,
            "category": category,
            "subcategory": subcategory,
            "source": todo["source"],
            "line": todo["line"],
            })

    entries.sort(key=lambda entry: (
        entry["category"],
        entry["subcategory"],
        entry["variable"] or "",
        entry["line"] or 0,
        ))
    return entries


def dump(path, payload):
    """YAML データファイルを書き出す。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        file.write(GENERATED_HEADER)
        yaml.safe_dump(
            payload,
            file,
            allow_unicode=True,
            sort_keys=False,
            default_flow_style=False,
            width=10000,
            )


def main():
    """Variable / Parameter のデータファイルを生成する。"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o", "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="生成先ディレクトリ (既定: docs/_data)",
        )
    args = parser.parse_args()
    output_dir = Path(args.output_dir)

    logging.basicConfig(level=logging.INFO, format="%(message)s")

    tax_benefit_system = CountryTaxBenefitSystem()

    todos = extract_source_todos(
        REPO_ROOT / "openfisca_japan" / "variables",
        set(tax_benefit_system.variables.keys()),
        )
    todos += extract_documentation_todos(tax_benefit_system)

    app_institutions = load_app_institutions(
        APP_CONFIG_PATH,
        set(tax_benefit_system.variables.keys()),
        )
    variables = build_variable_entries(tax_benefit_system, todos, app_institutions)
    institutions = build_institution_entries(variables, app_institutions)
    parameters = build_parameter_entries(tax_benefit_system.parameters)
    todo_entries = build_todo_entries(todos, variables)

    try:
        version = metadata.version("OpenFisca-Japan")
    except metadata.PackageNotFoundError:
        version = "unknown"

    dump(output_dir / "variables.yml", {"version": version, "items": variables})
    dump(output_dir / "parameters.yml", {"version": version, "items": parameters})
    dump(output_dir / "todos.yml", {"version": version, "items": todo_entries})
    dump(output_dir / "institutions.yml", {"version": version, "items": institutions})

    logger.info("生成しました: %s (Variable %d件)", output_dir / "variables.yml", len(variables))
    logger.info("生成しました: %s (Parameter %d件)", output_dir / "parameters.yml", len(parameters))
    logger.info("生成しました: %s (TODO %d件)", output_dir / "todos.yml", len(todo_entries))
    logger.info("生成しました: %s (制度 %d件)", output_dir / "institutions.yml", len(institutions))


if __name__ == "__main__":
    main()

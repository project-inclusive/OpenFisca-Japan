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
from importlib import metadata
import logging
import os
from pathlib import Path

from openfisca_core.parameters import Parameter, ParameterNode
from openfisca_japan import CountryTaxBenefitSystem
import yaml

# このスクリプトから見たリポジトリルート (tools/make_docs/ の2つ上)
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = REPO_ROOT / "docs" / "_data"

# 生成物であることを明示するヘッダ (手で編集されるのを防ぐ)
GENERATED_HEADER = (
    "# このファイルは tools/make_docs/make_docs.py により自動生成されています。\n"
    "# 直接編集せず、`make docs` で再生成してください。\n"
)

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


def build_variable_entries(tax_benefit_system):
    """全 Variable を TaxBenefitSystem から読み出し、データファイル用の辞書のリストにする。"""
    entries = []
    for name, variable in tax_benefit_system.variables.items():
        source = to_repo_relative(
            variable.introspection_data[0] if variable.introspection_data else None,
            )
        category, subcategory = split_category(source, "variables")
        possible_values = getattr(variable, "possible_values", None)

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
            "category": category,
            "subcategory": subcategory,
            "source": source,
            })

    # 生成物の差分を安定させるため並び順を固定する
    entries.sort(key=lambda entry: (entry["category"], entry["subcategory"], entry["name"]))
    return entries


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
                entries.append({
                    "name": child.name,
                    "description": child.description,
                    "reference": metadata_dict.get("reference"),
                    "unit": metadata_dict.get("unit"),
                    "values": [
                        {"date": str(value.instant_str), "value": value.value}
                        for value in child.values_list
                        ],
                    "category": category,
                    "subcategory": subcategory,
                    "source": source,
                    })
            # Scale(累進税率表)は現状 openfisca_japan では未使用のため対象外

    walk(parameter_node)
    entries.sort(key=lambda entry: entry["name"])
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
    variables = build_variable_entries(tax_benefit_system)
    parameters = build_parameter_entries(tax_benefit_system.parameters)

    try:
        version = metadata.version("OpenFisca-Japan")
    except metadata.PackageNotFoundError:
        version = "unknown"

    dump(output_dir / "variables.yml", {"version": version, "items": variables})
    dump(output_dir / "parameters.yml", {"version": version, "items": parameters})

    logger.info("生成しました: %s (Variable %d件)", output_dir / "variables.yml", len(variables))
    logger.info("生成しました: %s (Parameter %d件)", output_dir / "parameters.yml", len(parameters))


if __name__ == "__main__":
    main()

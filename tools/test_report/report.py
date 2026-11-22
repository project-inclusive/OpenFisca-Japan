"""Build a deterministic frontend test inventory and gap report without running tests."""

import argparse
from collections import Counter
import csv
import fnmatch
import json
from pathlib import Path
import re
import subprocess
import sys

import yaml


BASE = Path(__file__).resolve().parents[2]
METRICS = ("statements", "branches", "functions", "lines")


def read_json(path):
    """Read optional JSON; malformed existing input is an error, not missing data."""
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def dashboard_path(value):
    """Normalize runner absolute paths, including data copied from another checkout."""
    value = str(value).replace("\\", "/")
    if "/dashboard/" in value:
        return value.rsplit("/dashboard/", 1)[1]
    return value.removeprefix("dashboard/")


def vitest_list(data):
    """Read Vitest list output, keeping project and location for syntax matching."""
    if not isinstance(data, list):
        raise ValueError("Vitest list must be a JSON array")
    return [{"file": dashboard_path(row["file"]), "name": row["name"],
             "project": row.get("projectName", "unit"),
             "line": row.get("location", {}).get("line"), "tags": row.get("tags", [])}
            for row in data]


def playwright_tests(data):
    """Flatten Playwright suites; each project instance is a distinct test."""
    if data.get("errors"):
        raise ValueError("Playwright collection/report errors: " + str(data["errors"]))
    rows = []

    def visit(suite, ancestors):
        for spec in suite.get("specs", []):
            for test in spec["tests"]:
                rows.append({"file": "e2e/" + dashboard_path(spec["file"]).removeprefix("e2e/"),
                             "name": " > ".join(ancestors + [spec["title"]]),
                             "project": test["projectName"], "line": spec.get("line"),
                             "tags": [tag.removeprefix("@") for tag in spec.get("tags", [])],
                             "attempts": test.get("results", []), "expected": test.get("expectedStatus", "passed")})
        for child in suite.get("suites", []):
            visit(child, ancestors + ([child["title"]] if child.get("line") else []))

    for suite in data.get("suites", []):
        visit(suite, [])
    return rows


VITEST_SKIPS = {"pending": "skipped", "todo": "skipped", "disabled": "skipped"}


def playwright_outcome(row):
    """Classify the final retry of one Playwright test instance against its expected status."""
    attempts = row["attempts"]
    status = attempts[-1]["status"] if attempts else "unexecuted"
    if status in ("skipped", "unexecuted"):
        return status
    return "passed" if status == row["expected"] else "failed"


def result_counts(data, engine):
    """Count final test outcomes, not retries or suites; preserve unknown outcomes."""
    counts = Counter()
    if engine == "playwright":
        for row in playwright_tests(data):
            counts[playwright_outcome(row)] += 1
    else:
        for file in data.get("testResults", []):
            for test in file.get("assertionResults", []):
                status = test["status"]
                counts[VITEST_SKIPS.get(status, status)] += 1
        if data.get("numFailedTestSuites", 0) and not counts["failed"]:
            counts["suite_errors"] = data["numFailedTestSuites"]
    return counts


def outcomes_by_test(data, engine):
    """Map each result to the list key (file, name[, project]); repeated keys keep result order."""
    outcomes = {}
    if engine == "playwright":
        for row in playwright_tests(data):
            outcomes.setdefault((row["file"], row["name"], row["project"]), []).append(playwright_outcome(row))
    else:
        for file in data.get("testResults", []):
            for test in file.get("assertionResults", []):
                name = " > ".join(list(test.get("ancestorTitles", [])) + [test["title"]])
                status = VITEST_SKIPS.get(test["status"], test["status"])
                outcomes.setdefault((dashboard_path(file["name"]), name), []).append(status)
    return outcomes


def extract_targets(source, config, dashboard):
    """Extend syntax-derived domain targets with implementation files and manual classes."""
    targets = {row["id"]: row for row in source["targets"]}
    for file in sorted((dashboard / "src").rglob("*")):
        name = file.relative_to(dashboard).as_posix()
        if file.suffix not in (".ts", ".tsx") or re.search(r"\.(test|spec|stories)\.|\.d\.ts$|TestUtils\.", name):
            continue
        if name.startswith("src/mocks/") or name == "src/testSetup.ts":
            continue
        targets["file:" + name] = {"id": "file:" + name, "group": "file", "source": name}
    for row in config.get("manual_targets", []):
        if not row.get("reason"):
            raise ValueError("Manual target requires reason: " + row["id"])
        if not (dashboard / row["source"]).exists():
            raise ValueError("Manual target source missing: " + row["source"])
        targets[row["id"]] = row
    for group in config["applicability"]:
        if not any(row["group"] == group for row in targets.values()):
            raise ValueError("No targets extracted for group: " + group)
    return dict(sorted(targets.items()))


SCHEMA = Path(__file__).with_name("viewpoints.schema.json")
SCHEMA_RULES = {"type", "enum", "properties", "required", "additionalProperties", "propertyNames",
                "minProperties", "items", "minItems", "minLength", "pattern", "oneOf", "$ref"}
SCHEMA_NOTES = {"$schema", "$id", "title", "description", "definitions"}
SCHEMA_TYPES = {"object": dict, "array": list, "string": str, "integer": int, "boolean": bool}


def load_schema(path=SCHEMA):
    """Read the JSON Schema; a keyword this small checker does not apply is an error, not ignored."""
    schema = json.loads(path.read_text(encoding="utf-8"))

    def visit(node, where):
        unknown = set(node) - SCHEMA_RULES - SCHEMA_NOTES
        if unknown:
            raise ValueError(f"Unsupported schema keyword at {where}: {sorted(unknown)}")
        if "type" in node and node["type"] not in SCHEMA_TYPES:
            raise ValueError(f"Unsupported schema type at {where}: {node['type']}")
        if "$ref" in node and (len(node) > 1 or not node["$ref"].startswith("#/definitions/")):
            raise ValueError(f"Schema $ref must be alone and local at {where}")
        children = [(f"{where}.{key}", node[key]) for key in ("additionalProperties", "propertyNames", "items")
                    if isinstance(node.get(key), dict)]
        children += [(f"{where}.properties.{key}", value) for key, value in node.get("properties", {}).items()]
        children += [(f"{where}.oneOf[{index}]", value) for index, value in enumerate(node.get("oneOf", []))]
        children += [(f"{where}.definitions.{key}", value) for key, value in node.get("definitions", {}).items()]
        for child, value in children:
            visit(value, child)

    visit(schema, "(root)")
    return schema


def type_name(value):
    """Name a YAML value in JSON Schema terms for error messages."""
    if value is None or isinstance(value, bool):
        return "null" if value is None else "boolean"
    return next((name for name, kind in SCHEMA_TYPES.items() if isinstance(value, kind)), type(value).__name__)


def shape_errors(value, schema, root, path):
    """Apply the supported subset of JSON Schema; return `path: problem` lines."""
    if "$ref" in schema:
        return shape_errors(value, root["definitions"][schema["$ref"].rsplit("/", 1)[1]], root, path)
    if "oneOf" in schema:
        results = [shape_errors(value, option, root, path) for option in schema["oneOf"]]
        if sum(not errors for errors in results) == 1:
            return []
        # Report the form of the same type, e.g. a missing key in the object form rather than "not a string".
        typed = [errors for option, errors in zip(schema["oneOf"], results)
                 if errors and resolve(option, root).get("type") == type_name(value)]
        return typed[0] if len(typed) == 1 else [f"{path}: must match exactly one allowed form"]
    expected = schema.get("type")
    if expected and type_name(value) != expected:
        return [f"{path}: expected {expected}, got {type_name(value)}"]
    if "enum" in schema and value not in schema["enum"]:
        return [f"{path}: must be one of {schema['enum']}"]
    errors = []
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            errors.append(f"{path}: must not be empty")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errors.append(f"{path}: {value!r} does not match {schema['pattern']}")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errors.append(f"{path}: needs at least {schema['minItems']} item(s)")
        for index, item in enumerate(value):
            errors += shape_errors(item, schema.get("items", {}), root, f"{path}[{index}]")
    if isinstance(value, dict):
        properties = schema.get("properties", {})
        if len(value) < schema.get("minProperties", 0):
            errors.append(f"{path}: needs at least {schema['minProperties']} key(s)")
        errors += [f"{path}: missing required key {key!r}" for key in schema.get("required", []) if key not in value]
        for key, item in value.items():
            where = f"{path}.{key}" if re.fullmatch(r"\w+", str(key)) else f"{path}[{str(key)!r}]"
            if not isinstance(key, str):
                errors.append(f"{where}: key must be a string")
            elif "propertyNames" in schema:
                errors += [f"{where}: key {error.split(': ', 1)[1]}"
                           for error in shape_errors(key, schema["propertyNames"], root, where)]
            if key in properties:
                errors += shape_errors(item, properties[key], root, where)
            elif schema.get("additionalProperties", True) is False:
                errors.append(f"{path}: unknown key {key!r}")
            elif isinstance(schema.get("additionalProperties"), dict):
                errors += shape_errors(item, schema["additionalProperties"], root, where)
    return errors


def resolve(schema, root):
    """Follow a local $ref to the definition it names."""
    while "$ref" in schema:
        schema = root["definitions"][schema["$ref"].rsplit("/", 1)[1]]
    return schema


def check_shape(config, schema=None):
    """Reject unknown keys, missing required items and wrong types with the key path, before any content check."""
    schema = load_schema() if schema is None else schema
    errors = shape_errors(config, schema, schema, "(root)")
    if errors:
        raise ValueError("viewpoints.yaml shape errors (see viewpoints.schema.json):\n" + "\n".join(errors))


def known_tags(config):
    """Get the authoritative tag vocabulary from the editable YAML."""
    return {f"{view}:{condition}" for view, details in config["viewpoints"].items()
            for condition in details["conditions"]}


def check_definitions(config, source, dashboard, targets):
    """Reject definition drift, stale mappings and unknown tags before rendering."""
    tags = known_tags(config)
    declared = set(re.findall(r"name:\s*['\"]([^'\"]+)['\"]", (dashboard / "testReportTags.ts").read_text()))
    if declared != tags:
        raise ValueError(f"Tag definition drift: YAML only={sorted(tags - declared)}, TS only={sorted(declared - tags)}")
    for row in source["tests"]:
        unknown = set(row["tags"]) - tags
        if unknown:
            raise ValueError(f"Unknown test tags: {row['file']}:{row['line']}: {sorted(unknown)}")
    for group, cells in config["applicability"].items():
        if set(cells) - tags:
            raise ValueError("Unknown applicability tags: " + group)
    for file, cells in config.get("file_cells", {}).items():
        if "file:" + file not in targets or set(cells) - tags:
            raise ValueError("Invalid file cells: " + file)
    for rule in config.get("classification_rules", []):
        if not any(fnmatch.fnmatch(row["file"], rule["file"]) for row in source["tests"]):
            raise ValueError("Stale classification file: " + rule["file"])
        if not rule.get("tags") or set(rule["tags"]) - tags:
            raise ValueError("Invalid classification tags: " + str(rule))
        re.compile(rule["name"])
    for rule in config.get("bindings", []):
        if not any(fnmatch.fnmatch(row["file"], rule["file"]) for row in source["tests"]):
            raise ValueError("Stale binding file: " + rule["file"])
        if set(rule["targets"]) - targets.keys() or set(rule.get("tags", [])) - tags:
            raise ValueError("Invalid binding: " + str(rule))
    for rule in config.get("exclusions", []):
        if not rule.get("reason") or not any(fnmatch.fnmatch(target, rule["target"]) for target in targets):
            raise ValueError("Exclusion needs existing target and reason: " + str(rule))
        if set(rule["cells"]) - tags - {"*"}:
            raise ValueError("Unknown exclusion cell: " + str(rule))


def source_tags(test, declarations):
    """Match syntax metadata to collected tests, including each-expanded instances."""
    candidates = [row for row in declarations if row["file"] == test["file"]]
    # Generated Storybook lines can point at a different original story. Prefer names.
    stories = [row for row in candidates if row["kind"] == "story"]
    if stories:
        named = [row for row in stories if row["name"] == test["name"].split(" > ")[-1]]
        return named[0]["tags"] if len(named) == 1 else []
    line = test.get("line")
    if line is None:
        return []
    # Prefer the name, then the callee end, then the declaration start.
    # Source traversal order breaks ties without merging unrelated test tags.
    for field in ("nameLine", "callLine", "line"):
        exact = [row for row in candidates if row.get(field) == line]
        if exact:
            return exact[0]["tags"]
    return []


def classification_tags(test, config):
    """Apply file/name patterns independently from source metadata and targets."""
    return sorted({tag for rule in config.get("classification_rules", [])
                   if fnmatch.fnmatch(test["file"], rule["file"]) and re.search(rule["name"], test["name"])
                   for tag in rule["tags"]})


def excluded_file(file, config):
    """Only whole-file exclusions remove a file from coverage gap candidates."""
    return any(fnmatch.fnmatch("file:" + file, rule["target"]) and "*" in rule["cells"]
               for rule in config.get("exclusions", []))


def coverage_judgements(coverage, config, threshold):
    """Judge each file measured in both stages; None means a stage is unmeasured and nothing is judged.

    Use the higher stage value per metric; never add percentages or imply a union.
    """
    if any(coverage.get(scope) is None for scope in ("unit", "ui")):
        return None
    judged = {}
    for file in sorted(coverage["unit"].keys() & coverage["ui"].keys() - {"total"}):
        if excluded_file(file, config):
            continue
        below = []
        for metric in METRICS:
            rows = [coverage[scope][file][metric] for scope in ("unit", "ui")]
            measured = [row["pct"] for row in rows if row["total"] > 0 and isinstance(row["pct"], (int, float))]
            unknown = any(row["total"] > 0 and not isinstance(row["pct"], (int, float)) for row in rows)
            if measured and not unknown and max(measured) < threshold:
                below.append(f"{metric}={max(measured):g}%")
        zero = all(coverage[scope][file]["statements"]["total"] > 0 and coverage[scope][file]["statements"]["pct"] == 0
                   for scope in ("unit", "ui"))
        judged[file] = (below, zero)
    return judged


def coverage_gaps(coverage, config, threshold):
    """List low-coverage files with their failing metrics, and files at 0% in both stages."""
    judged = coverage_judgements(coverage, config, threshold) or {}
    low = [file + " (" + ", ".join(below) + ")" for file, (below, _) in judged.items() if below]
    zero = [file for file, (_, both) in judged.items() if both]
    return low, zero


def composition_lines(config, tests, source, problems):
    """Combine automatic imports/counts with explicit human descriptions."""
    files = {row["file"]: row.get("imports", []) for row in (source or {}).get("files", [])}
    files.update({test["file"]: files.get(test["file"], []) for test in tests})
    lines = ["## テストの構成", "", "対象は直接のローカル import から抽出（型・補助コードも含む）。件数と観点は一覧から集計し、説明は定義ファイルで管理する。", "",
             "| ファイル | 段階 | 確かめる対象（import） | 件数 | 観点の内訳 | 確かめていること | 確かめていないこと |",
             "| --- | --- | --- | ---: | --- | --- | --- |"]
    for file, imports in sorted(files.items()):
        rows = [test for test in tests if test["file"] == file]
        stage_id = "e2e" if file.startswith("e2e/") else "ui" if re.search(r"\.(browser\.test|stories)\.", file) else "unit"
        stages = sorted({test["stage"] for test in rows}) or [stage_id]
        # Count a test once per viewpoint even when it carries several conditions.
        counts = Counter(view for test in rows for view in {tag.split(":")[0] for tag in test["tags"]})
        breakdown = ", ".join(f"{view}: {count}" for view, count in sorted(counts.items())) or "未分類"
        description = config.get("test_descriptions", {}).get(file, {})
        unavailable = any(stage in problems for stage in stages)
        count = "未取得" if unavailable else str(len(rows))
        if unavailable:
            breakdown = "未取得"
        cells = [file, ", ".join(stages), ", ".join(imports) or "直接のローカルimportなし", count,
                 breakdown, description.get("verifies", "説明なし"), description.get("does_not_verify", "説明なし")]
        lines.append("| " + " | ".join(escape(value) for value in cells) + " |")
    lines += ["", "| 全体の受け持ち | 段階 | 範囲 |", "| --- | --- | --- |"]
    lines += ["| " + " | ".join(escape(row[key]) for key in ("area", "stages", "scope")) + " |" for row in config.get("responsibilities", [])]
    return lines


def observed_transitions(machine, trace):
    """Executed evidence per transition, or None when the trace is missing or from another version."""
    if machine is None or trace is None or trace.get("fingerprint") != machine["fingerprint"]:
        return None
    return trace["tests"]


TRANSITION_COLUMNS = ["遷移ID", "状態", "event", "分岐", "到着先", "ガード", "通過", "通過したテスト"]
TRANSITION_PASSED = ("通過", "未通過", "判定不能")


def transition_rows(machine, trace):
    """One row per declared transition; the id is `state / event / branch index`."""
    if machine is None:
        return []
    observed = observed_transitions(machine, trace)
    rows = []
    for edge in machine["transitions"]:
        source, event, branch = edge["id"].rsplit(" / ", 2)
        tests = (observed or {}).get(edge["id"], [])
        passed = "判定不能" if observed is None else "通過" if tests else "未通過"
        rows.append([edge["id"], edge.get("source", source), edge.get("event", event), branch, edge["target"],
                     "あり" if edge["guarded"] else "なし", passed, DETAIL_SEPARATOR.join(tests)])
    return rows


REPRESENTATIVE_COLUMNS = ["質問", "代表回答の数", "代表回答（JSON）"]


def representative_rows(machine):
    """One row per question with the finite representative answers used for adjacency probes."""
    if machine is None:
        return []
    return [[key, len(values), json.dumps(values, ensure_ascii=False)]
            for key, values in sorted(machine["representatives"].items())]


def transition_lines(machine, trace):
    """Distinguish structural alternatives, representative probes, and executed evidence; rows go to CSV."""
    lines = ["### 状態機械の分かれ道", ""]
    if machine is None:
        return lines + ["遷移未取得。状態機械の抽出を実行する。", ""]
    observed = observed_transitions(machine, trace)
    rows = transition_rows(machine, trace)
    counts = Counter(row[6] for row in rows)
    guarded = sum(row[5] == "あり" for row in rows)
    lines += [f"宣言された遷移: {len(rows)}（うちガードあり {guarded}）。ガードの選択肢・回答保存の自己遷移・alwaysを個別に数える。",
              f"代表回答での1段の隣接探索: {machine['probes']} 試行、重複を除く状態・世帯員・event・到着先: {machine['sampled']}。代表回答を決めた質問: {len(machine['representatives'])}。",
              "グラフの宣言から全分岐を列挙し、getAdjacencyMapで代表回答を試す。合成contextと履歴の探索は到達可能性や全回答組合せの保証ではない。",
              "通過の根拠は既存questionStateテスト実行時のXState microstep（ガードの選択肢を含む）。通過はassertionの強さを表さない。",
              f"テストが通した遷移: {counts['通過'] if observed is not None else '未取得'} / 通していない遷移: {counts['未通過'] if observed is not None else '判定不能'}。",
              "実行記録はモデル・質問定義・テストのハッシュが一致する場合だけ採用する。実行結果の成功・同じ版での採取もテストの状況と合わせて確認する。", ""]
    if observed is None:
        lines += ["実行記録なし、または版が不一致。`cd dashboard && npm run test -- --config ../tools/test_report/trace.config.mjs` で採取する。", ""]
    lines += ["| 遷移の分母 | 通過 | 未通過 | 判定不能 |", "| ---: | ---: | ---: | ---: |",
              f"| {len(rows)} | " + " | ".join(str(counts[key]) for key in TRANSITION_PASSED) + " |", "",
              "遷移ごとの到着先・ガード・通過したテストは `transitions.csv`、質問ごとの代表回答は `representatives.csv` にある。"]
    return lines + [""]


def bindings_for(test, config, targets):
    """Use explicit file/name rules, current-question titles, and runner projects."""
    assigned = set()
    for rule in config["bindings"]:
        if fnmatch.fnmatch(test["file"], rule["file"]) and re.search(rule.get("name", ".*"), test["name"]):
            assigned.update(rule["targets"])
    if test["file"] == "src/state/questionState.test.ts":
        parts = test["name"].split(": ")
        if len(parts) > 1 and "question:" + parts[1] in targets:
            assigned.add("question:" + parts[1])
    device = "device:" + test["project"]
    if device in targets:
        assigned.add(device)
    return assigned


def build_matrix(tests, targets, config):
    """Build expected cells first, then fill only explicitly classified assertions."""
    matrix = {}
    for target, row in targets.items():
        cells = config.get("file_cells", {}).get(row["source"], config["applicability"][row["group"]]) if row["group"] == "file" else config["applicability"][row["group"]]
        for cell in cells:
            reasons = [rule["reason"] for rule in config.get("exclusions", [])
                       if fnmatch.fnmatch(target, rule["target"]) and ("*" in rule["cells"] or cell in rule["cells"])]
            matrix[target, cell] = {"tests": [], "exclusion": " / ".join(reasons)}
    unclassified = []
    for test in tests:
        matched = False
        for target in bindings_for(test, config, targets):
            for tag in test["tags"]:
                if (target, tag) in matrix and not matrix[target, tag]["exclusion"]:
                    matrix[target, tag]["tests"].append(test)
                    matched = True
        if not matched or not test["tags"]:
            unclassified.append(test)
    return matrix, unclassified


def coverage_rows(data):
    """Read all four metrics, preserving n/a and empty-file denominators."""
    return {dashboard_path(file): {metric: row[metric] for metric in METRICS} for file, row in data.items()}


def pct(metric):
    """Format a coverage metric without turning n/a into zero."""
    return str(metric["pct"]) + ("%" if isinstance(metric["pct"], (int, float)) else "")


def escape(value):
    """Escape untrusted test names for Markdown table cells."""
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("|", "&#124;").replace("\n", " ").replace("`", "&#96;").replace("_", "&#95;")


CELL_STATES = ("埋まり", "空き", "対象外")


def cell_state(evidence):
    """A cell is excluded with a reason, filled by at least one test, or an unexplained gap."""
    return "対象外" if evidence["exclusion"] else "埋まり" if evidence["tests"] else "空き"


def label_of(test):
    """Identify one listed test the way the cell table always has: stage / project / name (file:line)."""
    line = test.get("line")
    return f"{test['stage']} / {test['project']} / {test['name']} ({test['file']}:{'?' if line is None else line})"


def state_counts(cells, key):
    """Count cell states per key, keeping the first-seen key order."""
    counts = {}
    for (target, cell), evidence in cells:
        counts.setdefault(key(target, cell), Counter())[cell_state(evidence)] += 1
    return counts


def state_table(heading, names, counts):
    """Markdown rows of filled / gap / excluded counts with a total row."""
    lines = [f"| {heading} | " + " | ".join(CELL_STATES) + " | ます |", "| --- | " + " | ".join(["---:"] * (len(CELL_STATES) + 1)) + " |"]
    total = Counter()
    for key, name in names:
        row = counts.get(key, Counter())
        total.update(row)
        lines.append(f"| {escape(name)} | " + " | ".join(str(row[state]) for state in CELL_STATES) + f" | {sum(row.values())} |")
    lines.append("| 計 | " + " | ".join(str(total[state]) for state in CELL_STATES) + f" | {sum(total.values())} |")
    return lines


CSV_GUIDE = [
    ("tests.csv", "一覧のテスト 1 件", "`未分類` を「はい」に絞る。`結果` を「失敗」に絞る。`ファイル` で並べる。"),
    ("cells.csv", "対象×観点・条件のます 1 つ", "`状態` を「空き」に絞る（理由のない空き）。さらに `観点` や `対象のグループ` で絞る。「対象外」に絞って `対象外の理由` を読む。"),
    ("transitions.csv", "宣言された遷移 1 つ", "`通過` を「未通過」に絞り `状態` で並べる。`ガード` を「あり」に絞る。"),
    ("representatives.csv", "代表回答を決めた質問 1 つ", "`質問` で探し、`代表回答（JSON）` を読む。"),
    ("coverage.csv", "ファイル×段階（unit・ui）", "`基準未満の指標` が空でない行に絞る（低網羅率）。`段階` を絞り `Branches` を昇順に並べる。`両方で0%` を「はい」に絞る。"),
    ("targets.csv", "対象 1 つ", "`抽出` を「手動」に絞り `手動定義の理由` を読む。`グループ` で絞る。"),
]


def render(config, tests, targets, matrix, unclassified, statuses, coverage, problems, threshold, source=None, machine=None, trace=None):
    """Render the summary and counts as Markdown; per-row details are written to the CSV files."""
    tables = detail_tables(config, tests, targets, matrix, unclassified, {}, coverage, threshold, machine, trace)
    lines = ["# フロントエンドのテストレポート", "",
             "この文書は集計だけを載せる。ます・遷移・網羅率・対象の1行ずつの詳細は、同じディレクトリの CSV にある（「詳細の CSV」の節）。", ""]
    lines += composition_lines(config, tests, source, problems) + ["", "## 概要", "",
             "一覧はテスト本体を実行せず収集する。件数はパラメーターと project を展開した件数。E2E はモック応答の smoke。", "",
             "| 段階 | ファイル数 | 件数 |", "| --- | ---: | ---: |"]
    for stage in config["stages"]:
        rows = [t for t in tests if t["stage"] == stage["id"]]
        unavailable = stage["id"] in problems
        lines.append(f"| {stage['name']} | {'未取得' if unavailable else len({t['file'] for t in rows})} | {'未取得' if unavailable else len(rows)} |")
        if stage["id"] == "e2e":
            for project in stage["projects"]:
                lines.append(f"| E2E / {project} | — | {sum(t['project'] == project for t in rows)} |")
    for stage, problem in problems.items():
        lines += ["", f"- 一覧未取得（{stage}）: {escape(problem)}。この段階の不足候補は一覧取得後に再確認する。"]
    cells = list(matrix.items())
    views = state_counts(cells, lambda target, cell: cell.split(":")[0])
    groups = state_counts(cells, lambda target, cell: targets[target]["group"])
    group_targets = Counter(targets[target]["group"] for target in {target for target, _ in matrix})
    lines += ["", "## 観点×条件", "",
              "対象（実装）ごとに期待する観点・条件のますを、埋まり（確かめているテストがある）・空き（不足候補）・対象外（理由付き）に分けて数える。"
              "タグは確かめていることの分類であり、確かめ方の強さ（1本の経路だけ、1項目だけ等）や成功を示さない。"
              "ますごとの埋めたテストと対象外の理由は `cells.csv` にある。", ""]
    lines += state_table("観点", [(view, f"{view}（{details['name']}）") for view, details in config["viewpoints"].items()], views)
    lines += [""] + state_table("対象のグループ（対象の数）", [(group, f"{group}（{group_targets[group]}）") for group in groups], groups)
    lines += ["", "## テストの状況", "", "結果は指定された JSON の最終試行。現在の一覧・コードと同じ版で採取したかは利用者が確認する。テストごとの結果は `tests.csv` の `結果` にある。", ""]
    for stage in config["stages"]:
        counts = statuses.get(stage["id"])
        if counts is None:
            lines += [f"- {stage['name']}: 未実行。`cd dashboard && {stage['run']}`"]
        else:
            lines += [f"- {stage['name']}: 成功 {counts['passed']} / 失敗 {counts['failed']} / スキップ {counts['skipped']} / 未実行 {counts['unexecuted']} / suite エラー {counts['suite_errors']}"]
            actual = sum(value for key, value in counts.items() if key != "suite_errors")
            listed = sum(test["stage"] == stage["id"] for test in tests)
            if actual != listed:
                lines += [f"  - 一覧 {listed} 件と結果 {actual} 件が不一致。採取時刻、フィルター、コードの版を確認する。"]
    lines += [""] + transition_lines(machine, trace)
    lines += ["## 網羅率", "", "unit と UI は同じ実装を別々に測る。百分率を足さない。n/a は未計測として扱う。値は全体（Istanbul の `total`）。ファイルごとの値は `coverage.csv` にある。", ""]
    measured = [scope for scope in ("unit", "ui") if coverage.get(scope) is not None]
    if measured:
        lines += ["| 段階 | ファイル数 | Statements | Branches | Functions | Lines |", "| --- | ---: | ---: | ---: | ---: | ---: |"]
        for scope in measured:
            rows = coverage[scope]
            total = rows.get("total")
            values = [pct(total[m]) if total else "—" for m in METRICS]
            lines.append(f"| {scope} | {len(rows.keys() - {'total'})} | " + " | ".join(values) + " |")
        lines.append("")
    for scope in ("unit", "ui"):
        if coverage.get(scope) is None:
            lines += [f"- {scope}: 未計測。`cd dashboard && npm run test:{'unit' if scope == 'unit' else 'ui'} -- --coverage`"]
    judged = coverage_judgements(coverage, config, threshold)
    excluded = sorted({file for scope in measured for file in coverage[scope] if excluded_file(file, config)})
    lines += ["", f"低網羅率の抽出基準: 指標ごとのunit/UIの最大値が {threshold:g}% 未満（既定80%）。両段階を照合し、片方で十分な実装を不足候補にしない。値は足さず、結合網羅率ではない。両段階のデータが揃わない、またはn/aの指標は判定しない。分母0の指標は候補に使わない。全条件が対象外のファイルは不足候補から除く。", ""]
    if judged is None:
        lines += ["- 基準を下回ったファイル: 判定できない（unit と UI の両方の網羅率が要る）。",
                  "- unit と UI の両方で 0% のファイル: 判定できない（両方の網羅率を採取する）。"]
    else:
        lines += [f"- 判定したファイル（両段階にあり対象外でない）: {len(judged)}",
                  f"- 基準を下回ったファイル: {sum(bool(below) for below, _ in judged.values())}（`coverage.csv` の `基準未満の指標` が空でない行）",
                  f"- unit と UI の両方で 0% のファイル: {sum(zero for _, zero in judged.values())}（`coverage.csv` の `両方で0%` が「はい」の行）"]
    lines += [f"- 対象外のファイル: {len(excluded)}（`coverage.csv` の `対象外` が「はい」の行。不足候補から除く）"]
    gaps = sum(cell_state(evidence) == "空き" for _, evidence in cells)
    used = {tag.split(":")[0] for test in tests for tag in test["tags"]}
    lines += ["", "## 不足しているテスト", "",
              f"- 理由のない空きのます: {gaps}（`cells.csv` の `状態` が「空き」の行）",
              "", "### テストのない観点", ""]
    lines += [f"- {view}: {details['name']}" for view, details in config["viewpoints"].items() if view not in used] or ["なし。"]
    lines += ["", f"### 未分類のテスト（{len(unclassified)}）", ""]
    lines += [f"- {escape(t['stage'] + ' / ' + t['file'] + ' / ' + t['name'])}" for t in unclassified] or ["なし。"]
    origin = Counter((row["group"], bool(row.get("reason"))) for row in targets.values())
    lines += ["", "## 対象の抽出根拠", "",
              "対象は構文・ファイルから抽出し、構文で決まらないものだけを理由付きで手で定義する。対象ごとのソースと理由は `targets.csv` にある。", "",
              "| グループ | 構文・ファイル | 手動 | 計 |", "| --- | ---: | ---: | ---: |"]
    for group in sorted({group for group, _ in origin}):
        lines.append(f"| {escape(group)} | {origin[group, False]} | {origin[group, True]} | {origin[group, False] + origin[group, True]} |")
    lines.append(f"| 計 | {sum(v for (_, manual), v in origin.items() if not manual)} | {sum(v for (_, manual), v in origin.items() if manual)} | {len(targets)} |")
    lines += ["", "## 詳細の CSV", "",
              "どれも BOM 付きの UTF-8 で、この文書と同じディレクトリに出る。表計算のソフトで開き、「データ」→「フィルター」で絞る。"
              "1つのセルに複数の値があるときは、テストと遷移の一覧は改行、観点・条件・対象は `; ` で区切る。列の意味は `tools/test_report/README.md` にある。", "",
              "| CSV | 1 行 | 行数 | 絞り方の例 |", "| --- | --- | ---: | --- |"]
    for name, unit, example in CSV_GUIDE:
        lines.append(f"| `{name}` | {unit} | {len(tables[name][1])} | {example} |")
    return "\n".join(lines) + "\n"


CSV_COLUMNS = ["段階", "project", "ファイル", "行", "テスト名", "観点", "条件", "対象", "未分類", "結果"]
CSV_OUTCOMES = {"passed": "成功", "failed": "失敗", "skipped": "スキップ", "unexecuted": "未実行"}
CSV_SEPARATOR = "; "
DETAIL_SEPARATOR = "\n"


def csv_rows(tests, matrix, unclassified, outcomes):
    """One row per listed test; the result is empty when its stage has no result JSON."""
    filled = {}
    for (target, _), evidence in matrix.items():
        for test in evidence["tests"]:
            filled.setdefault(id(test), set()).add(target)
    unknown = {id(test) for test in unclassified}
    remaining = {stage: {key: list(values) for key, values in rows.items()}
                 for stage, rows in outcomes.items() if rows is not None}
    rows = []
    for test in tests:
        result = ""
        if test["stage"] in remaining:
            key = (test["file"], test["name"], test["project"]) if test["stage"] == "e2e" else (test["file"], test["name"])
            queue = remaining[test["stage"]].get(key)
            status = queue.pop(0) if queue else "unexecuted"
            result = CSV_OUTCOMES.get(status, status)
        rows.append([test["stage"], test["project"], test["file"], "" if test.get("line") is None else test["line"],
                     test["name"], CSV_SEPARATOR.join(sorted({tag.split(":")[0] for tag in test["tags"]})),
                     CSV_SEPARATOR.join(test["tags"]), CSV_SEPARATOR.join(sorted(filled.get(id(test), ()))),
                     "はい" if id(test) in unknown else "いいえ", result])
    return rows


CELL_COLUMNS = ["対象", "対象のグループ", "観点", "条件", "状態", "テスト数", "埋めたテスト", "対象外の理由"]


def cell_rows(matrix, targets):
    """One row per expected (target, condition) cell, in the order the matrix was built."""
    return [[target, targets[target]["group"], cell.split(":")[0], cell, cell_state(evidence), len(evidence["tests"]),
             DETAIL_SEPARATOR.join(label_of(test) for test in evidence["tests"]), evidence["exclusion"]]
            for (target, cell), evidence in matrix.items()]


COVERAGE_COLUMNS = ["ファイル", "段階", "Statements", "Branches", "Functions", "Lines", "対象外", "基準未満の指標", "両方で0%"]


def coverage_csv_rows(coverage, config, threshold):
    """One row per file and measured stage; the judgement columns are empty when a file is not judged."""
    judged = coverage_judgements(coverage, config, threshold) or {}
    rows = []
    for scope in ("unit", "ui"):
        for file, metrics in sorted((coverage.get(scope) or {}).items()):
            below, zero = judged.get(file, ([], None))
            rows.append([file, scope] + [metrics[m]["pct"] for m in METRICS]
                        + ["はい" if excluded_file(file, config) else "いいえ", CSV_SEPARATOR.join(below),
                           "" if zero is None else "はい" if zero else "いいえ"])
    return rows


TARGET_COLUMNS = ["対象", "グループ", "ソース", "抽出", "手動定義の理由"]


def target_rows(targets):
    """One row per target with where it came from; manual targets always carry a reason."""
    return [[target, row["group"], row["source"], "手動" if row.get("reason") else "構文・ファイル", row.get("reason", "")]
            for target, row in targets.items()]


def detail_tables(config, tests, targets, matrix, unclassified, outcomes, coverage, threshold, machine, trace):
    """All CSV files by name, as (columns, rows); the Markdown counts are taken from the same inputs."""
    return {
        "tests.csv": (CSV_COLUMNS, csv_rows(tests, matrix, unclassified, outcomes)),
        "cells.csv": (CELL_COLUMNS, cell_rows(matrix, targets)),
        "transitions.csv": (TRANSITION_COLUMNS, transition_rows(machine, trace)),
        "representatives.csv": (REPRESENTATIVE_COLUMNS, representative_rows(machine)),
        "coverage.csv": (COVERAGE_COLUMNS, coverage_csv_rows(coverage, config, threshold)),
        "targets.csv": (TARGET_COLUMNS, target_rows(targets)),
    }


def write_csv(path, rows, columns=CSV_COLUMNS):
    """Write RFC 4180 quoting with a UTF-8 BOM so Excel detects the encoding on open."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(columns)
        writer.writerows(rows)


NOTE_BEGIN = "<!-- test-report:features:begin -->"
NOTE_END = "<!-- test-report:features:end -->"
NOTE_COMMAND = "python tools/test_report/report.py --write-test-note"
NOTE_FIRST_HEADING = "品質の観点"
NOTE_FINISH = "> **生成した区間はここまで。** ここから下は人が書く。"


def note_start(last_feature):
    """Visible opening line: the markers are HTML comments and do not show in a preview."""
    return (f"> **ここから生成した区間（「{NOTE_FIRST_HEADING}」から「{last_feature}」の節まで）。** "
            f"正本は `tools/test_report/viewpoints.yaml` で、`{NOTE_COMMAND}` で作り直す。手で直さない。")


def layer_of(file):
    """Name the test layer from the file layout used by the dashboard configs."""
    if file.startswith("e2e/visual/"):
        return "見た目の比較"
    if file.startswith("e2e/"):
        return "E2E"
    if ".stories." in file:
        return "story"
    if ".browser.test." in file:
        return "Browser Mode"
    return "単体"


def note_cell(value):
    """Keep a hand-readable Markdown cell; only the table syntax needs escaping."""
    return str(value).replace("|", "\\|").replace("\n", " ")


LAYERS = ["単体", "story", "Browser Mode", "E2E", "見た目の比較"]
BEHAVIOR_ID = "behavior"
BEHAVIOR = "振る舞い"


def note_sentences(value):
    """Join folded YAML sentences without the space that folding inserts after Japanese full stops."""
    return re.sub(r"。\s+", "。", " ".join(str(value).split()))


def feature_entries(feature, qualities):
    """Normalize feature files to (file, aspect ids); a bare string checks the behavior only."""
    entries = []
    for entry in feature.get("files", []):
        if isinstance(entry, str):
            entry = {"file": entry, "qualities": [BEHAVIOR_ID]}
        if not isinstance(entry, dict) or not entry.get("file") or not entry.get("qualities") \
                or set(entry) - {"file", "qualities"}:
            raise ValueError("Feature file needs a path or {file, qualities}: " + str(entry))
        unknown = sorted(set(entry["qualities"]) - set(qualities) - {BEHAVIOR_ID})
        if unknown:
            raise ValueError("Unknown quality in feature " + str(feature.get("name")) + ": " + ", ".join(unknown))
        entries.append((entry["file"], list(entry["qualities"])))
    return entries


def feature_lines(config, dashboard):
    """Render the feature conclusions and evidence tables from features, qualities and test_descriptions."""
    descriptions = config.get("test_descriptions", {})
    features = config.get("features", [])
    qualities = {row["id"]: row for row in config.get("qualities", [])}
    if not features:
        raise ValueError("features is required to write the test note")
    listed, entries = set(), {}
    for feature in features:
        if not all(feature.get(key) for key in ("name", "guarantees", "risks", "files")):
            raise ValueError("Feature requires name, guarantees, risks and files: " + str(feature.get("name")))
        rows = feature_entries(feature, qualities)
        files = [file for file, _ in rows]
        if len(files) != len(set(files)):
            raise ValueError("Duplicate file in feature: " + feature["name"])
        for file in files:
            if file not in descriptions:
                raise ValueError("Feature file has no test_descriptions: " + file)
            if not (dashboard / file).exists():
                raise ValueError("Feature file missing: " + file)
        listed.update(files)
        entries[feature["name"]] = rows
    missing = sorted(set(descriptions) - listed)
    if missing:
        raise ValueError("test_descriptions files without a feature: " + ", ".join(missing))

    def layers(rows, key):
        found = {layer_of(file) for file, ids in rows if key in ids}
        return " / ".join(layer for layer in LAYERS if layer in found) or "なし"

    names = {BEHAVIOR_ID: BEHAVIOR} | {key: row["name"] for key, row in qualities.items()}

    lines = [note_start(features[-1]["name"]), "",
             "### " + NOTE_FIRST_HEADING, "", "| 観点 | 確かめ方 |", "| --- | --- |"]
    lines += [f"| {note_cell(row['name'])} | {note_cell(row['description'])} |" for row in qualities.values()]
    lines += ["", "### 段階ごとの受け持ち", "", "| 受け持ち | 段階 | 範囲 |", "| --- | --- | --- |"]
    lines += ["| " + " | ".join(note_cell(row[key]) for key in ("area", "stages", "scope")) + " |"
              for row in config.get("responsibilities", [])]
    lines += ["", "### 機能ごとの観点と層", "",
              "ますは、その機能のその観点を確かめているテストの層である。「なし」は、その観点をその機能で確かめるテストがないことを示す。", "",
              "| 機能 | " + " | ".join(note_cell(name) for name in names.values()) + " |",
              "| " + " | ".join(["---"] * (len(names) + 1)) + " |"]
    for feature in features:
        rows = entries[feature["name"]]
        lines.append(f"| {note_cell(feature['name'])} | " + " | ".join(layers(rows, key) for key in names) + " |")
    for feature in features:
        lines += ["", "### " + feature["name"], "",
                  "- **保証していること**: " + note_sentences(feature["guarantees"]),
                  "- **保証していないこと（テストが通っても本番で起こりうること）**: " + note_sentences(feature["risks"]),
                  "", "根拠のファイル:", "",
                  "| 層 | ファイル | 観点 | 確かめていること | 確かめていないこと |", "| --- | --- | --- | --- | --- |"]
        for file, ids in entries[feature["name"]]:
            row = descriptions[file]
            aspect = "・".join(names[key] for key in names if key in ids)
            lines.append("| " + " | ".join([layer_of(file), f"`dashboard/{note_cell(file)}`", note_cell(aspect),
                                              note_cell(row["verifies"]), note_cell(row["does_not_verify"])]) + " |")
    return lines + ["", NOTE_FINISH]


def replace_note_region(text, lines):
    """Replace only the text between the markers; markers must appear once, in order."""
    if text.count(NOTE_BEGIN) != 1 or text.count(NOTE_END) != 1 or text.index(NOTE_BEGIN) > text.index(NOTE_END):
        raise ValueError(f"Test note needs one {NOTE_BEGIN} followed by one {NOTE_END}")
    head, rest = text.split(NOTE_BEGIN)
    _, tail = rest.split(NOTE_END)
    return head + NOTE_BEGIN + "\n\n" + "\n".join(lines) + "\n\n" + NOTE_END + tail


def collect(stage, dashboard, directory):
    """Collect lists into new files; remove stale lists before trying a command."""
    output = directory / stage["list"]
    output.unlink(missing_ok=True)
    result = subprocess.run(stage["command"], cwd=dashboard, capture_output=True, text=True, check=False)
    if result.returncode:
        error = result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}"
        output.with_suffix(".error.txt").write_text(error, encoding="utf-8")
        return error.splitlines()[0]
    data = json.loads(result.stdout)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output.with_suffix(".error.txt").unlink(missing_ok=True)
    return None


def main(argv=None):
    """Collect lists by default; allow offline re-rendering with explicit existing inputs."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=BASE)
    parser.add_argument("--input-dir", type=Path, default=Path("tmp/test-report"))
    parser.add_argument("--output", type=Path, default=Path("tmp/test-report/frontend.md"))
    parser.add_argument("--csv", type=Path, default=Path("tmp/test-report/tests.csv"), help="one row per listed test; the detail CSVs are written to the same directory")
    parser.add_argument("--definitions", type=Path, default=Path("tools/test_report/viewpoints.yaml"))
    parser.add_argument("--write-tags", action="store_true", help="regenerate dashboard/testReportTags.ts from YAML and exit")
    parser.add_argument("--write-test-note", action="store_true", help="rewrite the generated region of the test note from YAML and exit")
    parser.add_argument("--test-note", type=Path, default=Path("docs/test_note.md"))
    parser.add_argument("--offline",action="store_true", help="read existing lists without invoking runners")
    parser.add_argument("--low-coverage", type=float, default=80)
    args = parser.parse_args(argv)
    if not 0 <= args.low_coverage <= 100:
        parser.error("--low-coverage must be between 0 and 100")
    root = args.root.resolve()
    directory = root / args.input_dir
    dashboard = root / "dashboard"
    directory.mkdir(parents=True, exist_ok=True)
    config = yaml.safe_load((root / args.definitions).read_text(encoding="utf-8"))
    check_shape(config)
    if args.write_tags:
        tags = [{"name": tag} for tag in sorted(known_tags(config))]
        (dashboard / "testReportTags.ts").write_text(
            "// Generated from tools/test_report/viewpoints.yaml; checked by make test-report.\n"
            + "export const testReportTags = " + json.dumps(tags, indent=2) + ";\n", encoding="utf-8")
        return
    if args.write_test_note:
        note = root / args.test_note
        note.write_text(replace_note_region(note.read_text(encoding="utf-8"), feature_lines(config, dashboard)), encoding="utf-8")
        return
    source = json.loads(subprocess.check_output(["node", "tools/test_report/source_index.mjs", "dashboard"], cwd=root, text=True))
    targets = extract_targets(source, config, dashboard)
    check_definitions(config, source, dashboard, targets)
    tests, statuses, outcomes, problems = [], {}, {}, {}
    for stage in config["stages"]:
        problem = None if args.offline else collect(stage, dashboard, directory)
        data = read_json(directory / stage["list"])
        if problem or data is None:
            problems[stage["id"]] = problem or "一覧 JSON がない"
        else:
            rows = playwright_tests(data) if stage["id"] == "e2e" else vitest_list(data)
            for test in rows:
                if re.sub(r" \([^()]+\)$", "", test["project"]) not in stage["projects"]:
                    raise ValueError("Unknown project: " + test["project"])
                test["stage"] = stage["id"]
                syntax_tags = source_tags(test, source["tests"])
                if test["tags"] and set(test["tags"]) != set(syntax_tags):
                    raise ValueError("Runtime/source tag mismatch: " + test["name"])
                test["tags"] = sorted(set(test["tags"] or syntax_tags) | set(classification_tags(test, config)))
                tests.append(test)
        result = read_json(directory / stage["result"])
        engine = "playwright" if stage["id"] == "e2e" else "vitest"
        statuses[stage["id"]] = None if result is None else result_counts(result, engine)
        outcomes[stage["id"]] = None if result is None else outcomes_by_test(result, engine)
    coverage = {}
    for scope in ("unit", "ui"):
        data = read_json(dashboard / "coverage" / scope / "coverage-summary.json")
        coverage[scope] = None if data is None else coverage_rows(data)
    machine = json.loads(subprocess.check_output(["node", "tools/test_report/machine_graph.cjs"], cwd=root, text=True))
    trace = read_json(directory / "transitions.trace.json")
    matrix, unclassified = build_matrix(tests, targets, config)
    output = root / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render(config, tests, targets, matrix, unclassified, statuses, coverage, problems, args.low_coverage, source, machine, trace), encoding="utf-8")
    table = root / args.csv
    tables = detail_tables(config, tests, targets, matrix, unclassified, outcomes, coverage, args.low_coverage, machine, trace)
    display_path = output.relative_to(root) if output.is_relative_to(root) else output
    sys.stdout.write(f"{display_path}: {len(tests)} tests; {len(targets)} targets; {len(problems)} unavailable lists\n")
    for name, (columns, rows) in tables.items():
        # tests.csv keeps its --csv path; the detail CSVs are written next to it.
        path = table if name == "tests.csv" else table.parent / name
        write_csv(path, rows, columns)
        shown = path.relative_to(root) if path.is_relative_to(root) else path
        sys.stdout.write(f"{shown}: {len(rows)} rows\n")


if __name__ == "__main__":
    main()

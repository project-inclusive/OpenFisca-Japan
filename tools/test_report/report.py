"""Build a deterministic frontend test inventory and gap report without running tests."""

import argparse
from collections import Counter
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


def result_counts(data, engine):
    """Count final test outcomes, not retries or suites; preserve unknown outcomes."""
    counts = Counter()
    if engine == "playwright":
        for row in playwright_tests(data):
            attempts = row["attempts"]
            status = attempts[-1]["status"] if attempts else "unexecuted"
            if status == "skipped":
                counts["skipped"] += 1
            elif status == "unexecuted":
                counts["unexecuted"] += 1
            elif status == row["expected"]:
                counts["passed"] += 1
            else:
                counts["failed"] += 1
    else:
        for file in data.get("testResults", []):
            for test in file.get("assertionResults", []):
                status = test["status"]
                counts[{"pending": "skipped", "todo": "skipped", "disabled": "skipped"}.get(status, status)] += 1
        if data.get("numFailedTestSuites", 0) and not counts["failed"]:
            counts["suite_errors"] = data["numFailedTestSuites"]
    return counts


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


def coverage_gaps(coverage, config, threshold):
    """Use the higher stage value per metric; never add percentages or imply a union."""
    low, zero = [], []
    if any(coverage.get(scope) is None for scope in ("unit", "ui")):
        return low, zero
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
        if below:
            low.append(file + " (" + ", ".join(below) + ")")
        if all(coverage[scope][file]["statements"]["total"] > 0 and coverage[scope][file]["statements"]["pct"] == 0
               for scope in ("unit", "ui")):
            zero.append(file)
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


def transition_lines(machine, trace):
    """Distinguish structural alternatives, representative probes, and executed evidence."""
    lines = ["### 状態機械の分かれ道", ""]
    if machine is None:
        return lines + ["遷移未取得。状態機械の抽出を実行する。", ""]
    valid_trace = trace is not None and trace.get("fingerprint") == machine["fingerprint"]
    observed = trace["tests"] if valid_trace else {}
    edges = machine["transitions"]
    covered = sum(edge["id"] in observed for edge in edges)
    lines += [f"宣言された遷移: {len(edges)}。ガードの選択肢・回答保存の自己遷移・alwaysを個別に数える。",
              f"代表回答での1段の隣接探索: {machine['probes']} 試行、重複を除く状態・世帯員・event・到着先: {machine['sampled']}。",
              "グラフの宣言から全分岐を列挙し、getAdjacencyMapで代表回答を試す。合成contextと履歴の探索は到達可能性や全回答組合せの保証ではない。",
              "通過の根拠は既存questionStateテスト実行時のXState microstep（ガードの選択肢を含む）。通過はassertionの強さを表さない。",
              f"テストが通した遷移: {covered if valid_trace else '未取得'} / 通していない遷移: {len(edges) - covered if valid_trace else '判定不能'}。",
              "実行記録はモデル・質問定義・テストのハッシュが一致する場合だけ採用する。実行結果の成功・同じ版での採取もテストの状況と合わせて確認する。", ""]
    if not valid_trace:
        lines += ["実行記録なし、または版が不一致。`cd dashboard && npm run test -- --config ../tools/test_report/trace.config.mjs` で採取する。", ""]
    lines += ["| 質問 | 代表回答 |", "| --- | --- |"]
    lines += [f"| {escape(key)} | {escape(json.dumps(values, ensure_ascii=False))} |" for key, values in sorted(machine["representatives"].items())]
    lines += ["", "| 遷移ID（出発 / event / 分岐番号） | 到着 | ガード | テストの通過 |", "| --- | --- | --- | --- |"]
    for edge in edges:
        evidence = "; ".join(observed.get(edge["id"], [])) or ("未通過" if valid_trace else "記録未取得")
        lines.append(f"| {escape(edge['id'])} | {escape(edge['target'])} | {'あり' if edge['guarded'] else 'なし'} | {escape(evidence)} |")
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


def render(config, tests, targets, matrix, unclassified, statuses, coverage, problems, threshold, source=None, machine=None, trace=None):
    """Render inventory, evidence, coverage and actionable missing cells as Markdown."""
    lines = ["# フロントエンドのテストレポート", ""] + composition_lines(config, tests, source, problems) + ["", "## 概要", "",
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
    lines += ["", "## 観点×条件", "", "空きは不足の候補。タグは確かめていることの分類であり、確かめ方の強さ（1本の経路だけ、1項目だけ等）や成功を示さない。", "",
              "| 対象（実装） | 観点・条件 | 確かめているテスト（段階 / project / 名前） |", "| --- | --- | --- |"]
    gaps = []
    for (target, cell), evidence in matrix.items():
        if evidence["exclusion"]:
            value = "対象外: " + escape(evidence["exclusion"])
        elif evidence["tests"]:
            value = "<br>".join(escape(f"{test['stage']} / {test['project']} / {test['name']} ({test['file']}:{test.get('line', '?')})") for test in evidence["tests"])
        else:
            value = "空き（不足候補）"
            gaps.append((target, cell))
        lines.append(f"| {escape(target)} | {escape(cell)} | {value} |")
    lines += ["", "## テストの状況", "", "結果は指定された JSON の最終試行。現在の一覧・コードと同じ版で採取したかは利用者が確認する。", ""]
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
    lines += ["", "## 網羅率", "", "unit と UI は同じ実装を別々に測る。百分率を足さない。n/a は未計測として扱う。", ""]
    low, zero = coverage_gaps(coverage, config, threshold)
    for scope in ("unit", "ui"):
        rows = coverage.get(scope)
        if rows is None:
            lines += [f"- {scope}: 未計測。`cd dashboard && npm run test:{'unit' if scope == 'unit' else 'ui'} -- --coverage`", ""]
            continue
        lines += [f"### {scope}", "", "| ファイル | Statements | Branches | Functions | Lines |", "| --- | ---: | ---: | ---: | ---: |"]
        for file, metrics in sorted(rows.items()):
            lines.append("| " + escape(file) + ("（対象外）" if excluded_file(file, config) else "") + " | " + " | ".join(pct(metrics[m]) for m in METRICS) + " |")
        lines.append("")
    lines += ["## 不足しているテスト", "", f"低網羅率の抽出基準: 指標ごとのunit/UIの最大値が {threshold:g}% 未満（既定80%）。両段階を照合し、片方で十分な実装を不足候補にしない。値は足さず、結合網羅率ではない。両段階のデータが揃わない、またはn/aの指標は判定しない。分母0の指標は候補に使わない。全条件が対象外のファイルは不足候補から除く。", "",
              f"### 理由のない空きのます（{len(gaps)}）", ""]
    lines += [f"- {escape(target)} / {escape(cell)}" for target, cell in gaps] or ["なし。"]
    used = {tag.split(":")[0] for test in tests for tag in test["tags"]}
    lines += ["", "### テストのない観点", ""]
    lines += [f"- {view}: {details['name']}" for view, details in config["viewpoints"].items() if view not in used] or ["なし。"]
    lines += ["", f"### 未分類のテスト（{len(unclassified)}）", ""]
    lines += [f"- {escape(t['stage'] + ' / ' + t['file'] + ' / ' + t['name'])}" for t in unclassified] or ["なし。"]
    lines += ["", "### 網羅率が低いファイル", ""]
    lines += ["- " + escape(row) for row in low] or ["該当なし（未計測の段階は判定できない）。"]
    lines += ["", "### unit と UI の両方で 0% のファイル", ""]
    if coverage.get("unit") is None or coverage.get("ui") is None:
        lines += ["未計測のため判定できない。両方の網羅率を採取する。"]
    else:
        lines += ["- " + escape(file) for file in zero] or ["なし。"]
    lines += ["", "## 対象の抽出根拠", "", "| 対象 | ソース | 手動定義の理由 |", "| --- | --- | --- |"]
    lines += [f"| {escape(target)} | {escape(row['source'])} | {escape(row.get('reason', '構文・ファイルから抽出'))} |" for target, row in targets.items()]
    return "\n".join(lines) + "\n"


NOTE_BEGIN = "<!-- test-report:features:begin -->"
NOTE_END = "<!-- test-report:features:end -->"
NOTE_COMMAND = "python tools/test_report/report.py --write-test-note"


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


def feature_lines(config, dashboard):
    """Render the per-feature tables from features, test_descriptions and responsibilities."""
    descriptions = config.get("test_descriptions", {})
    features = config.get("features", [])
    if not features:
        raise ValueError("features is required to write the test note")
    listed = set()
    for feature in features:
        files = feature.get("files", [])
        if not feature.get("name") or not files:
            raise ValueError("Feature requires name and files: " + str(feature))
        if len(files) != len(set(files)):
            raise ValueError("Duplicate file in feature: " + feature["name"])
        for file in files:
            if file not in descriptions:
                raise ValueError("Feature file has no test_descriptions: " + file)
            if not (dashboard / file).exists():
                raise ValueError("Feature file missing: " + file)
        listed.update(files)
    missing = sorted(set(descriptions) - listed)
    if missing:
        raise ValueError("test_descriptions files without a feature: " + ", ".join(missing))
    lines = [f"<!-- この区間は `{NOTE_COMMAND}` で tools/test_report/viewpoints.yaml から生成する。手で直さない。 -->", "",
             "### 段階ごとの受け持ち", "", "| 受け持ち | 段階 | 範囲 |", "| --- | --- | --- |"]
    lines += ["| " + " | ".join(note_cell(row[key]) for key in ("area", "stages", "scope")) + " |"
              for row in config.get("responsibilities", [])]
    for feature in features:
        lines += ["", "### " + feature["name"], "",
                  "| 層 | ファイル | 確かめていること | 確かめていないこと |", "| --- | --- | --- | --- |"]
        for file in feature["files"]:
            row = descriptions[file]
            lines.append("| " + " | ".join([layer_of(file), f"`dashboard/{note_cell(file)}`",
                                              note_cell(row["verifies"]), note_cell(row["does_not_verify"])]) + " |")
    return lines


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
    tests, statuses, problems = [], {}, {}
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
        statuses[stage["id"]] = None if result is None else result_counts(result, "playwright" if stage["id"] == "e2e" else "vitest")
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
    display_path = output.relative_to(root) if output.is_relative_to(root) else output
    sys.stdout.write(f"{display_path}: {len(tests)} tests; {len(targets)} targets; {len(problems)} unavailable lists\n")


if __name__ == "__main__":
    main()

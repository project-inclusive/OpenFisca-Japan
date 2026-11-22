"""Test report adapters and gap accounting with small, isolated inputs."""

from collections import Counter
import copy
import csv
import io
import json
import re
import subprocess

import pytest
from tools.test_report.report import (
    BASE,
    build_matrix,
    CASE_DEFINITION,
    CELL_COLUMNS,
    CELL_STATES,
    check_definitions,
    check_shape,
    classification_tags,
    collect,
    composition_lines,
    COVERAGE_COLUMNS,
    coverage_gaps,
    coverage_rows,
    CSV_COLUMNS,
    csv_rows,
    detail_tables,
    EXCLUDED,
    extract_targets,
    feature_lines,
    FILLED,
    GAP,
    layer_of,
    load_schema,
    main,
    NOTE_BEGIN,
    NOTE_COMMAND,
    NOTE_END,
    NOTE_FINISH,
    NOTE_KEYS,
    note_start,
    outcomes_by_test,
    playwright_tests,
    read_json,
    ref,
    render,
    replace_note_region,
    REPRESENTATIVE_COLUMNS,
    result_counts,
    SCHEMA,
    SCHEMA_RULES,
    source_tags,
    TARGET_COLUMNS,
    TRACE_RUN,
    TRANSITION_COLUMNS,
    transition_lines,
    transition_rows,
    vitest_list,
    write_csv,
    )
import yaml


DETAIL_COLUMNS = {"tests.csv": CSV_COLUMNS, "cases.csv": CELL_COLUMNS, "transitions.csv": TRANSITION_COLUMNS,
                  "representatives.csv": REPRESENTATIVE_COLUMNS, "coverage.csv": COVERAGE_COLUMNS, "targets.csv": TARGET_COLUMNS}
SCOPE_NAMES = {"unit": "単体", "ui": "コンポーネント"}


def prose_int(value):
    """Read a prose number such as 1,248."""
    return int(value.replace(",", ""))


def read_csv(path):
    """Read the CSV as a spreadsheet would, after the UTF-8 BOM."""
    raw = path.read_bytes()
    assert raw.startswith(b"\xef\xbb\xbf")
    return list(csv.reader(io.StringIO(raw.decode("utf-8-sig"), newline="")))


def state_rows(section):
    """Parse `| name（label） | filled | gap | excluded | cells |` rows of one Markdown count table."""
    return {name: [int(value) for value in values] for name, *values in
            re.findall(r"^\| (\S+?)（[^）]*） \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|$", section, re.M)}


def assert_csv_match_markdown(report, directory):
    """Every CSV exists with its columns, and its row, state and gap counts equal the Markdown summary."""
    guide = {name: int(count) for name, count in re.findall(r"^\| `(\w+\.csv)` \| [^|]+ \| (\d+) \|", report, re.M)}
    assert guide.keys() == DETAIL_COLUMNS.keys()
    tables = {}
    for name, count in guide.items():
        header, *rows = read_csv(directory / name)
        assert header == DETAIL_COLUMNS[name], name
        assert len(rows) == count, name
        tables[name] = [dict(zip(header, row)) for row in rows]

    cells = tables["cases.csv"]
    assert {row["状態"] for row in cells} <= set(CELL_STATES)

    def expected(key):
        counts = {}
        for row in cells:
            counts.setdefault(row[key], [0] * len(CELL_STATES))[CELL_STATES.index(row["状態"])] += 1
        return {name: values + [sum(values)] for name, values in counts.items()}

    views, groups = report.split("| 観点 | ", 1)[1].split("| 対象のグループ", 1)
    groups = groups.split("## テストの状況", 1)[0]
    assert {name: values for name, values in state_rows(views).items() if values[-1]} == expected("観点")
    assert state_rows(groups) == expected("対象のグループ")
    total = re.search(r"^\| 計 \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|$", views, re.M).groups()
    assert [int(value) for value in total] == [sum(row["状態"] == state for row in cells) for state in CELL_STATES] + [len(cells)]
    gaps = [row for row in cells if row["状態"] == GAP]
    total_gaps, by_view = re.search(r"^\| テストのない確認ケース（不足の候補） \| (\d+)（観点ごと: ([^）]*)） \|", report, re.M).groups()
    assert int(total_gaps) == len(gaps)
    by_view = dict(item.split(" ") for item in by_view.split("・"))
    assert all(int(value) == sum(row["観点"] == view for row in gaps) for view, value in by_view.items())
    assert {row["観点"] for row in gaps} <= by_view.keys()
    assert all(row["テスト数"] == "0" and not row["確かめたテスト"] and not row["対象外の理由"] for row in gaps)
    assert all(row["対象外の理由"] for row in cells if row["状態"] == EXCLUDED)
    assert all(int(row["テスト数"]) == len(row["確かめたテスト"].split("\n")) for row in cells if row["状態"] == FILLED)
    stated = re.search(r"期待する確認ケース ([\d,]+) のうち、テストありは ([\d,]+)、テストなし（不足の候補）は ([\d,]+)、対象外（理由つき）は ([\d,]+) である。", report)
    assert [prose_int(value) for value in stated.groups()] == [len(cells)] + [sum(row["状態"] == state for row in cells) for state in CELL_STATES]
    if gaps:
        assert f"テストのない確認ケース（不足の候補）は {len(gaps):,} か所で" in report

    unclassified = sum(row["未分類"] == "はい" for row in tables["tests.csv"])
    assert (f"### 未分類のテスト（{unclassified}）" in report) == bool(unclassified)
    assert ("未分類のテストはない。" in report) != bool(unclassified)
    assert f"| 未分類のテスト | {unclassified} |" in report

    transitions = tables["transitions.csv"]
    if transitions:
        passed = [sum(row["通過"] == state for row in transitions) for state in ("通過", "未通過", "判定不能")]
        summary = re.search(r"^\| 遷移の分母 .*\n.*\n\| (\d+) \| (\d+) \| (\d+) \| (\d+) \|$", report, re.M).groups()
        assert [int(value) for value in summary] == [len(transitions)] + passed
        assert f"| 状態機械の遷移 | 通過 {passed[0]} / {len(transitions)}（未通過 {passed[1]}・判定不能 {passed[2]}） |" in report
        assert f"ガードのある遷移は {sum(row['ガード'] == 'あり' for row in transitions):,} である。" in report
        assert f"代表回答を {len(tables['representatives.csv']):,} の質問に決め" in report
        if not passed[2]:
            assert f"{len(transitions):,} の遷移のうち {passed[0]:,} を通った。" in report

    coverage = tables["coverage.csv"]
    low = re.search(r"基準の [\d.]+% を下回ったファイルは ([\d,]+)、単体とコンポーネントの両方で 0% のファイルは ([\d,]+) である", report)
    summary_low = re.search(r"^\| 網羅率が基準（[\d.]+%）を下回ったファイル \| ([^|]+) \|", report, re.M).group(1)
    if low:
        assert prose_int(low.group(1)) == len({row["ファイル"] for row in coverage if row["基準未満の指標"]}) == int(summary_low)
        assert prose_int(low.group(2)) == len({row["ファイル"] for row in coverage if row["両方で0%"] == "はい"})
    else:
        assert summary_low.startswith("判定できない")
        assert "網羅率が低いファイルは判定できない" in report and not any(row["基準未満の指標"] or row["両方で0%"] for row in coverage)
    totals = re.search(r"^\| 網羅率の全体（Statements / Branches / Functions / Lines） \| ([^|]+) \|", report, re.M).group(1)
    for scope in ("unit", "ui"):
        total = next((row for row in coverage if row["段階"] == scope and row["ファイル"] == "total"), None)
        if total:
            values = " / ".join(total[name] + ("%" if re.fullmatch(r"[\d.]+", total[name]) else "")
                                for name in ("Statements", "Branches", "Functions", "Lines"))
            # The small fixtures define only the unit stage, so ui keeps its id.
            assert any(f"{name}: {values}" in totals for name in (SCOPE_NAMES[scope], scope))
        elif not any(row["段階"] == scope for row in coverage):
            assert f"{SCOPE_NAMES[scope]}: 未計測" in totals
    excluded = int(re.search(r"対象外のファイル: (\d+)", report).group(1))
    assert excluded == len({row["ファイル"] for row in coverage if row["対象外"] == "はい"})
    missing = [SCOPE_NAMES[scope] for scope in ("unit", "ui") if not any(row["段階"] == scope for row in coverage)]
    if missing:
        assert "と".join(missing) + "の網羅率を測っていないため" in report
    else:
        assert "網羅率を測っていない" not in report

    targets = tables["targets.csv"]
    manual = sum(row["抽出"] == "手動" for row in targets)
    stated = re.search(r"確かめる対象 ([\d,]+) のうち、([\d,]+) は構文と実装ファイルから取り出し、(?:([\d,]+) は構文で決まらない|手で定義した対象はない)", report)
    assert [prose_int(value or "0") for value in stated.groups()] == [len(targets), len(targets) - manual, manual]
    assert all(row["手動定義の理由"] for row in targets if row["抽出"] == "手動")
    return tables


@pytest.fixture
def config():
    """Use two independent expectations rather than deriving them from tests."""
    return {"viewpoints": {"input": {"name": "入力", "conditions": ["normal", "empty"]}},
            "applicability": {"template": ["input:normal", "input:empty"]},
            "bindings": [{"file": "src/age.test.ts", "targets": ["template:age"]}],  # noqa: FS003
            "stages": [{"id": "unit", "name": "単体", "projects": ["unit"], "run": "npm test"}],
            "manual_targets": [], "exclusions": []}


def test_vitest_list_and_source_locations():
    """Each-expanded tests share a declaration; copied absolute paths normalize."""
    rows = vitest_list([{"name": "age 0", "file": "/old/dashboard/src/age.test.ts",
                         "projectName": "unit", "location": {"line": 12}}])
    declaration = {"file": "src/age.test.ts", "line": 12, "tags": ["input:normal"], "kind": "test"}  # noqa: FS003
    assert source_tags(rows[0], [declaration]) == ["input:normal"]
    rows[0]["line"] = 15
    assert source_tags(rows[0], [dict(declaration, callLine=15)]) == ["input:normal"]
    rows[0]["line"] = 99
    assert source_tags(rows[0], [declaration]) == []
    with pytest.raises(ValueError):
        vitest_list({"testResults": []})


def test_story_names_are_explicit_fallback():
    """Generated Storybook locations can differ from the original story source."""
    row = {"file": "src/age.stories.tsx", "name": "空のとき、進めない", "line": 3}  # noqa: FS003
    declaration = dict(row, line=20, tags=["input:empty"], kind="story")
    assert source_tags(row, [declaration]) == ["input:empty"]
    wrong_story = dict(declaration, line=3, name="別のstory", tags=["input:normal"])
    assert source_tags(row, [wrong_story, declaration]) == ["input:empty"]


def test_source_location_priority_and_same_line_ties():
    """Prefer precise locations and retain the first declaration's tags on ties."""
    row = {"file": "src/age.test.ts", "name": "age 0", "line": 12}  # noqa: FS003
    start = dict(row, tags=["input:normal"], kind="test")
    call = dict(start, line=10, callLine=12, tags=["input:empty"])
    name = dict(start, line=8, callLine=9, nameLine=12, tags=["input:boundary"])
    assert source_tags(row, [start, call, name]) == name["tags"]
    assert source_tags(row, [start, call]) == call["tags"]
    assert source_tags(row, [start, dict(start, tags=["input:empty"])]) == start["tags"]
    assert source_tags(row, [name, dict(name, tags=["input:empty"])]) == name["tags"]
    assert source_tags(dict(row, line=None), [start]) == []
    assert source_tags(dict(row, file="src/other.test.ts"), [name]) == []  # noqa: FS003


def pw_data(statuses):
    """Make nested suites containing two browser instances and retry attempts."""
    return {"suites": [{"title": "file.spec.ts", "suites": [{"title": "flow", "line": 1,
            "specs": [{"file": "file.spec.ts", "title": "next", "line": 5,
                       "tags": ["@input:normal"], "tests": [
                           {"projectName": project, "results": [{"status": s} for s in attempts]}
                           for project, attempts in statuses.items()]}]}]}]}


def test_playwright_list_and_final_outcomes():
    """Count browser instances and the final retry, not the sum of attempts."""
    data = pw_data({"chromium": [], "webkit": []})
    rows = playwright_tests(data)
    assert len(rows) == 2
    assert rows[0]["file"] == "e2e/file.spec.ts"
    assert rows[0]["name"] == "flow > next"
    assert rows[0]["tags"] == ["input:normal"]
    assert result_counts(data, "playwright")["unexecuted"] == 2
    counts = result_counts(pw_data({"chromium": ["failed", "passed"], "webkit": ["skipped"]}), "playwright")
    assert counts == {"passed": 1, "skipped": 1}
    assert result_counts(pw_data({"chromium": ["timedOut"]}), "playwright")["failed"] == 1
    with pytest.raises(ValueError):
        playwright_tests({"errors": [{"message": "collection failed"}]})


def test_vitest_results_include_skips_and_suite_errors():
    """Do not report an import failure with zero assertions as a passing run."""
    counts = result_counts({"numFailedTestSuites": 1, "testResults": [{"assertionResults": [
        {"status": "passed"}, {"status": "pending"}, {"status": "todo"}]}]}, "vitest")
    assert counts == {"passed": 1, "skipped": 2, "suite_errors": 1}


def test_expected_matrix_does_not_depend_on_tests(config):
    """Empty expectations remain gaps; exclusions require explicit reasons."""
    targets = {"template:age": {"group": "template", "source": "src/age.ts"}}  # noqa: FS003
    row = {"file": "src/age.test.ts", "name": "age 0", "project": "unit", "stage": "unit", "tags": ["input:normal"]}  # noqa: FS003
    matrix, unclassified = build_matrix([row], targets, config)
    assert matrix["template:age", "input:normal"]["tests"] == [row]
    assert matrix["template:age", "input:empty"]["tests"] == []
    assert unclassified == []
    config["exclusions"] = [{"target": "template:age", "cells": ["input:empty"], "reason": "optional"}]
    assert build_matrix([], targets, config)[0]["template:age", "input:empty"]["exclusion"] == "optional"
    assert build_matrix([dict(row, tags=[])], targets, config)[1]
    assert build_matrix([dict(row, file="src/new.test.ts")], targets, config)[1]


def test_drift_and_invalid_exclusion_fail(config, tmp_path):
    """Editing either definition independently must produce an actionable error."""
    declarations = {"tests": [{"file": "src/age.test.ts", "line": 1, "tags": ["input:normal"]}]}  # noqa: FS003
    targets = {"template:age": {"group": "template", "source": "src/age.ts"}}  # noqa: FS003
    tags = tmp_path / "testReportTags.ts"
    tags.write_text("[{name: 'input:normal'}, {name: 'input:empty'}]")  # noqa: FS003
    check_definitions(config, declarations, tmp_path, targets)
    tags.write_text("[{name: 'input:normal'}]")  # noqa: FS003
    with pytest.raises(ValueError, match="drift"):
        check_definitions(config, declarations, tmp_path, targets)
    tags.write_text("[{name: 'input:normal'}, {name: 'input:empty'}]")  # noqa: FS003
    config["exclusions"] = [{"target": "template:age", "cells": ["*"], "reason": ""}]
    with pytest.raises(ValueError, match="reason"):
        check_definitions(config, declarations, tmp_path, targets)


def metric(value):
    """Construct an Istanbul summary metric."""
    return {"total": 10, "covered": value / 10, "pct": value, "skipped": 0}


def test_coverage_and_markdown(config):
    """Keep unit/UI separate, include all metrics and expose uncategorized tests."""
    data = {"total": {key: metric(90) for key in ("statements", "branches", "functions", "lines")},
            "/old/dashboard/src/age.ts": {key: metric(0) for key in ("statements", "branches", "functions", "lines")}}
    coverage = coverage_rows(data)
    assert coverage["src/age.ts"]["lines"]["pct"] == 0
    targets = {"template:age": {"group": "template", "source": "src/age.ts"}}  # noqa: FS003
    row = {"file": "src/age.test.ts", "name": "a|b_<script>", "stage": "unit", "project": "unit", "tags": []}  # noqa: FS003
    matrix, unknown = build_matrix([row], targets, config)
    both = {"unit": coverage, "ui": copy.deepcopy(coverage)}
    text = render(config, [row], targets, matrix, unknown, {"unit": None}, both, {}, 80)
    assert "単体は実行結果がないため、通ったかは分からない。取り方は注記 2。" in text
    assert "| テストのない確認ケース（不足の候補） | 2（観点ごと: input 2） |" in text
    assert "| テストの実行結果 | 単体: 結果なし |" in text
    assert "| 網羅率の全体（Statements / Branches / Functions / Lines） | 単体: 90% / 90% / 90% / 90%、ui: 90% / 90% / 90% / 90% |" in text
    assert "| 網羅率が基準（80%）を下回ったファイル | 1 |" in text
    assert "| 状態機械の遷移 | 遷移未取得 |" in text
    assert "未分類のテスト（1）" in text and "未分類のテストが 1 件あり" in text
    assert "a&#124;b&#95;&lt;script&gt;" in text, "unclassified tests stay listed in the Markdown"
    assert "| 単体 | 1 | 90% | 90% | 90% | 90% |" in text and "| ui | 1 | 90% | 90% | 90% | 90% |" in text
    assert "全体の網羅率は、単体が 文 90%・分岐 90%・関数 90%・行 90%、ui が 文 90%・分岐 90%・関数 90%・行 90% である（注記 7）。" in text
    assert "基準の 80% を下回ったファイルは 1、単体とコンポーネントの両方で 0% のファイルは 1 である（注記 8）。" in text
    assert "src/age.ts" not in text, "per-file coverage belongs to coverage.csv"
    rows = detail_tables(config, [row], targets, matrix, unknown, {}, both, 80, None, None)["coverage.csv"][1]
    assert ["src/age.ts", "unit", 0, 0, 0, 0, "いいえ", "statements=0%; branches=0%; functions=0%; lines=0%", "はい"] in rows  # noqa: FS003
    assert ["total", "ui", 90, 90, 90, 90, "いいえ", "", ""] in rows
    headings = ["## 集計", "## テストの構成", "## 確認ケース", "## テストの状況", "## 網羅率", "## 不足しているテスト",
                "## 詳細の CSV", "## 注記"]
    assert [text.index(heading) for heading in headings] == sorted(text.index(heading) for heading in headings)
    assert "## 対象の抽出根拠" not in text, "how targets were extracted is a note, the rows are in targets.csv"
    title, intro, first = [block for block in text.split("\n\n")][:3]
    assert title.startswith("# ") and not intro.startswith("#") and first == "## 集計", \
        "the summary comes right after the title and its one paragraph"
    assert "## 概要" not in text, "the former overview is part of the summary"
    assert "確かめ方の強さ" in text.split("## 注記", 1)[1]
    half = render(config, [row], targets, matrix, unknown, {"unit": None}, {"unit": coverage, "ui": None}, {}, 80)
    assert "ui の網羅率を測っていないため、網羅率が低いファイルは判定できない。測り方は注記 7。" in half
    assert "`cd dashboard && npm run test:ui -- --coverage`" in half.split("## 注記", 1)[1]
    none = render(config, [row], targets, matrix, unknown, {"unit": None}, {"unit": None, "ui": None}, {}, 80)
    assert "単体と ui の網羅率を測っていないため" in none and "全体の網羅率は" not in none


def test_csv_files_match_markdown_summary(config, tmp_path):
    """Cells, transitions, coverage and targets in CSV agree with every count the Markdown shows."""
    targets = {"template:age": {"group": "template", "source": "src/age.ts"},  # noqa: FS003
               "template:name": {"group": "template", "source": "src/name.ts", "reason": "手で定義する"}}  # noqa: FS003
    config["bindings"][0]["targets"] = ["template:age", "template:name"]
    config["exclusions"] = [{"target": "template:name", "cells": ["input:empty"], "reason": "空にできない"}]
    tests = [{"file": "src/age.test.ts", "name": "age 0", "project": "unit", "stage": "unit", "line": 4, "tags": ["input:normal"]},  # noqa: FS003
             {"file": "src/age.test.ts", "name": "age 1", "project": "unit", "stage": "unit", "line": None, "tags": ["input:normal"]},  # noqa: FS003
             {"file": "src/new.test.ts", "name": "未分類", "project": "unit", "stage": "unit", "line": 1, "tags": []}]  # noqa: FS003

    def metrics(value, total=10):
        return {key: dict(metric(value), total=total) for key in ("statements", "branches", "functions", "lines")}

    coverage = {"unit": {"total": metrics(50), "src/weak.ts": metrics(20), "src/zero.ts": metrics(0), "src/main.tsx": metrics(0)},  # noqa: FS003
                "ui": {"total": metrics(60), "src/weak.ts": metrics(30), "src/zero.ts": metrics(0), "src/main.tsx": metrics(0),  # noqa: FS003
                       "src/ui.ts": metrics(90)}}  # noqa: FS003
    config["exclusions"].append({"target": "file:src/main.tsx", "cells": ["*"], "reason": "起動の入口"})  # noqa: FS003
    machine = {"fingerprint": "v", "probes": 4, "sampled": 2, "representatives": {"年齢": [{"type": "Age"}]}, "transitions": [
        {"id": "年齢 / next / 0", "source": "年齢", "event": "next", "target": "年収", "guarded": True},
        {"id": "年齢 / next / 1", "source": "年齢", "event": "next", "target": "結果", "guarded": False},
        {"id": "年収 / always / 0", "source": "年収", "event": "always", "target": "結果", "guarded": False}]}
    trace = {"fingerprint": "v", "tests": {"年齢 / next / 0": ["a > 次へ", "b > 次へ"]}}
    matrix, unclassified = build_matrix(tests, targets, config)
    for observed in (trace, None):
        text = render(config, tests, targets, matrix, unclassified, {"unit": None}, coverage, {}, 80, None, machine, observed)
        for name, (columns, rows) in detail_tables(config, tests, targets, matrix, unclassified, {}, coverage, 80, machine, observed).items():
            write_csv(tmp_path / name, rows, columns)
        tables = assert_csv_match_markdown(text, tmp_path)
    assert "| input（入力） | 2 | 1 | 1 | 4 |" in text
    assert "| テストのない確認ケース（不足の候補） | 1（観点ごと: input 1） |" in text and "### 未分類のテスト（1）" in text
    assert "| 3 | 0 | 0 | 3 |" in text, "without a matching trace every transition is undecidable"
    assert "| 状態機械の遷移 | 通過 0 / 3（未通過 0・判定不能 3） |" in text
    assert "3 の遷移があるが、通過の記録がないため、どれを通ったかは分からない。記録の取り方は注記 6。" in text
    cells = {(row["対象"], row["条件"]): row for row in tables["cases.csv"]}
    assert cells["template:age", "input:normal"]["確かめたテスト"] == \
        "unit / unit / age 0 (src/age.test.ts:4)\nunit / unit / age 1 (src/age.test.ts:?)"  # noqa: FS003
    assert cells["template:age", "input:normal"]["状態"] == "テストあり"
    assert cells["template:age", "input:empty"]["状態"] == "テストなし（不足の候補）"
    assert cells["template:name", "input:empty"]["状態"] == "対象外（理由つき）"
    assert cells["template:name", "input:empty"]["対象外の理由"] == "空にできない"
    text = render(config, tests, targets, matrix, unclassified, {"unit": None}, coverage, {}, 80, None, machine, trace)
    assert "| 3 | 1 | 2 | 0 |" in text and "| 状態機械の遷移 | 通過 1 / 3（未通過 2・判定不能 0） |" in text
    assert "3 の遷移のうち 1 を通った。未通過の 2 は `transitions.csv` で確かめられる。" in text
    rows = transition_rows(machine, dict(trace, tests={"年齢 / next / 0": ["b > 次へ", "a > 次へ"]}))
    assert rows[0] == ["年齢 / next / 0", "年齢", "next", "0", "年収", "あり", "通過", "a > 次へ\nb > 次へ"], \
        "the passing tests are sorted whatever order the run recorded them in"
    assert rows[2][1:4] == ["年収", "always", "0"]
    assert "- 判定したファイル（両方の段階にあり対象外でない）: 2" in text
    assert "基準の 80% を下回ったファイルは 2、単体とコンポーネントの両方で 0% のファイルは 1 である" in text
    assert "- 対象外のファイル: 1" in text
    assert "確かめる対象 2 のうち、1 は構文と実装ファイルから取り出し、1 は構文で決まらないため理由をつけて手で定義した（`template` 1）。" in text


def sections(text):
    """Map each `##` / `###` heading to the blocks under it, up to the next heading."""
    found, heading = {}, None
    for block in text.split("\n\n"):
        if block.startswith("## ") or block.startswith("### "):
            heading = block.split(" ", 1)[1]
            found[heading] = []
        elif heading:
            found[heading].append(block)
    return found


def test_sections_open_with_conclusions_and_methods_are_numbered_notes(config):
    """Each section starts with what was found; how it was made and counted is in the last section, by number."""
    targets = {"template:age": {"group": "template", "source": "src/age.ts"}}  # noqa: FS003
    tests = [{"file": "src/age.test.ts", "name": "age 0", "project": "unit", "stage": "unit", "line": 4, "tags": ["input:normal"]}]  # noqa: FS003
    machine = {"fingerprint": "v", "probes": 4, "sampled": 2, "representatives": {"年齢": [{"type": "Age"}]}, "transitions": [
        {"id": "年齢 / next / 0", "target": "年収", "guarded": True}]}
    matrix, unclassified = build_matrix(tests, targets, config)
    text = render(config, tests, targets, matrix, unclassified, {"unit": Counter(passed=1)}, {"unit": None, "ui": None}, {}, 80,
                  None, machine, None)
    found = sections(text)
    assert found["集計"][0].startswith("テスト 1 件（単体 1）はすべて通った。未分類のテストは 0 件である。")
    assert "テストのない確認ケース（不足の候補）は 1 か所で、多いのは入力（1）である。" in found["集計"][0]
    assert found["集計"][1] == CASE_DEFINITION and found["集計"][2].startswith("|"), \
        "the check case is explained where it first appears, before the tables"
    assert found["テストの状況"][0].startswith("すべての段階のテストが通った。")
    assert found["網羅率"][0].startswith("単体と ui の網羅率を測っていないため")
    for heading, blocks in found.items():
        if heading != "注記":
            assert blocks and not blocks[0].startswith(("|", "-", "<", "1.")) and blocks[0].endswith("。"), heading
    body, notes_text = text.split("\n## 注記\n", 1)
    numbers = [int(line.split(".", 1)[0]) for line in notes_text.splitlines() if re.match(r"\d+\. ", line)]
    assert numbers == list(range(1, len(NOTE_KEYS) + 1)) and text.rstrip().endswith(notes_text.rstrip())
    assert {int(n) for n in re.findall(r"注記 (\d+)", body)} <= set(numbers)
    assert ref("results") == "注記 2" and ref("trace") in found["状態機械の分かれ道"][0]
    for method in ("getAdjacencyMap", "microstep", "SHA-256", "n/a", "Istanbul", "本体を実行せず", "最終試行", "80% 未満", "展開した件数"):
        assert method not in body and method in notes_text, method
    for old in ("ます", "埋まり", "空き", "cells.csv"):
        assert old not in text, old


def test_csv_quotes_values_and_leaves_results_empty_without_json(config, tmp_path):
    """Commas, quotes and newlines survive a round trip; one row per listed test."""
    targets = {"template:age": {"group": "template", "source": "src/age.ts"}}  # noqa: FS003
    tricky = {"file": "src/age.test.ts", "name": 'age, "0"\nnext', "project": "unit", "stage": "unit",  # noqa: FS003
              "line": 3, "tags": ["input:empty", "input:normal"]}
    loose = {"file": "src/new.test.ts", "name": "未分類", "project": "unit", "stage": "unit", "line": None, "tags": []}  # noqa: FS003
    matrix, unclassified = build_matrix([tricky, loose], targets, config)
    table = tmp_path / "out" / "tests.csv"
    write_csv(table, csv_rows([tricky, loose], matrix, unclassified, {"unit": None}))
    assert '"age, ""0""\nnext"'.encode() in table.read_bytes()
    header, first, second = read_csv(table)
    assert header == ["段階", "project", "ファイル", "行", "テスト名", "観点", "条件", "対象", "未分類", "結果"]
    assert first == ["unit", "unit", "src/age.test.ts", "3", tricky["name"], "input",  # noqa: FS003
                     "input:empty; input:normal", "template:age", "いいえ", ""]
    assert second == ["unit", "unit", "src/new.test.ts", "", "未分類", "", "", "", "はい", ""]  # noqa: FS003


def test_csv_results_follow_final_attempt_and_list_keys(config):
    """Playwright matches by project; Vitest by file and describe path; missing results are unexecuted."""
    rows = playwright_tests(pw_data({"chromium": ["failed", "passed"], "webkit": []}))
    for row in rows:
        row.update(stage="e2e", tags=[])
    outcomes = {"e2e": outcomes_by_test(pw_data({"chromium": ["failed", "passed"], "webkit": ["timedOut"]}), "playwright")}
    assert [row[-1] for row in csv_rows(rows, {}, rows, outcomes)] == ["成功", "失敗"]
    vitest = {"testResults": [{"name": "/x/dashboard/src/age.test.ts", "assertionResults": [
        {"ancestorTitles": ["age"], "title": "same", "status": "passed"},
        {"ancestorTitles": ["age"], "title": "same", "status": "pending"},
        {"ancestorTitles": [], "title": "odd", "status": "unknown"}]}]}
    outcomes = {"unit": outcomes_by_test(vitest, "vitest")}
    assert outcomes["unit"][("src/age.test.ts", "age > same")] == ["passed", "skipped"]  # noqa: FS003
    listed = [{"file": "src/age.test.ts", "name": name, "project": "unit", "stage": "unit", "tags": []}  # noqa: FS003
              for name in ("age > same", "age > same", "odd", "age > new")]
    # Results follow the list order; the rows are then sorted by name.
    assert [(row[4], row[-1]) for row in csv_rows(listed, {}, listed, outcomes)] == [
        ("age > new", "未実行"), ("age > same", "スキップ"), ("age > same", "成功"), ("odd", "unknown")]
    assert outcomes["unit"][("src/age.test.ts", "age > same")] == ["passed", "skipped"], "input must not be consumed"  # noqa: FS003


def test_optional_and_malformed_json(tmp_path):
    """Missing evidence is unknown; malformed evidence must never look unmeasured."""
    path = tmp_path / "optional.json"
    assert read_json(path) is None
    path.write_text("not json")
    with pytest.raises(json.JSONDecodeError):
        read_json(path)


def test_collection_failure_removes_stale_inventory(tmp_path, monkeypatch):
    """A failed new collection cannot silently reuse an older successful list."""
    output = tmp_path / "unit.list.json"
    output.write_text("[]")
    monkeypatch.setattr(subprocess, "run", lambda *args, **kwargs: subprocess.CompletedProcess(args, 1, "", "blocked server"))
    assert collect({"list": output.name, "command": ["vitest", "list"]}, tmp_path, tmp_path) == "blocked server"
    assert not output.exists()
    assert output.with_suffix(".error.txt").read_text() == "blocked server"


def test_source_extraction_does_not_execute_test_bodies(tmp_path):
    """Syntax extraction discovers new routes, questions, templates and projects."""
    files = {
        "src/App.tsx": "const routes = [{path: '/new'}];",  # noqa: FS003
        "src/state/questionDefinition.ts": "const q = {'新しい質問': {type: 'Age'}, 見積もりモード: {type: 'Selection', selections: ['簡単', '詳細', '災害']}};",  # noqa: FS003
        "src/components/questions/template/newQuestionTemplate.tsx": "export const Template = () => null;",
        "src/components/errors/NewError.tsx": "export const Error = () => null;",
        "src/components/result/benefit.tsx": "export const Benefit = () => null;",
        "src/hooks/calculate.ts": "const url = import.meta.env.VITE_BRANCH === 'new' ? 'url' : 'fallback';",
        "src/example.test.ts": "import { Template } from './components/questions/template/newQuestionTemplate'; throw new Error('must never execute');\nit.each([1,2])(\n  'value %s', {tags: ['input:normal']}, () => {});",  # noqa: FS003
        "e2e/flow.spec.ts": "test('next', {tag: ['@input:normal']}, () => {});",  # noqa: FS003
        "playwright.config.ts": "const config = {projects: [{name: 'new-browser'}]};",  # noqa: FS003
        }
    for file, text in files.items():
        path = tmp_path / file
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
    result = json.loads(subprocess.check_output(["node", "tools/test_report/source_index.mjs", str(tmp_path)], cwd=BASE, text=True))
    ids = {row["id"] for row in result["targets"]}
    assert {"route:/new", "question:新しい質問", "template:newQuestionTemplate", "mode:災害", "device:new-browser", "environment:new", "error:NewError", "result:給付"} <= ids
    assert next(row for row in result["files"] if row["file"] == "src/example.test.ts")["imports"] == ["src/components/questions/template/newQuestionTemplate.tsx"]
    assert len(result["tests"]) == 2
    assert all(row["tags"] == ["input:normal"] for row in result["tests"])
    declaration = next(row for row in result["tests"] if row["name"] == "value %s")
    assert (declaration["line"], declaration["callLine"], declaration["nameLine"]) == (2, 2, 3)


def test_current_target_inventory_and_definition_consistency():
    """The checked-in configuration must reference real targets and declarations."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    source = json.loads(subprocess.check_output(["node", "tools/test_report/source_index.mjs", "dashboard"], cwd=BASE, text=True))
    targets = extract_targets(source, config, BASE / "dashboard")
    check_definitions(config, source, BASE / "dashboard", targets)
    assert sum(row["group"] == "mode" for row in targets.values()) == 3
    assert sum(row["group"] == "device" for row in targets.values()) == 5
    assert all(row["tags"] or classification_tags(row, config) for row in source["tests"])


def test_offline_cli_accepts_browser_instance_and_story_metadata(tmp_path):
    """Handle Vitest's expanded browser project name and generated story lines."""
    (tmp_path / "ui.list.json").write_text(json.dumps([{
        "file": "/copied/dashboard/src/components/errors/errors.stories.tsx",
        "name": "汎用エラーのとき、エラー画面を表示する",
        "projectName": "storybook (chromium)", "location": {"line": 999},
        }]))
    output = tmp_path / "frontend.md"
    main(["--offline", "--input-dir", str(tmp_path), "--output", str(output), "--csv", str(tmp_path / "tests.csv")])
    report = output.read_text()
    assert "コンポーネント（story・Browser Mode） | 1 | 1" in report
    tables = assert_csv_match_markdown(report, tmp_path)
    assert any(row["確かめたテスト"].startswith("ui / storybook (chromium) / 汎用エラー") for row in tables["cases.csv"])
    assert "未分類のテストはない。" in report and "### 未分類のテスト" not in report
    assert "単体は一覧を取れなかったため、件数と不足の候補に含めていない" in report
    assert f"`cd dashboard && {TRACE_RUN}`" in report.split("## 注記", 1)[1], "the unit command records transitions too"


def test_browser_name_line_classifies_all_error_width_cases(tmp_path):
    """Real Browser Mode list locations classify all nine expanded error cases."""
    errors = {"generic": "GenericError", "not found": "NotFoundError", "response": "FormResponseError"}
    data = [{"name": f"UI at {width} CSS pixels > 画面幅ごとに、{name} エラーが収まりキーボードで復帰できる",
             "file": "/copied/dashboard/src/components/layout/uiCompatibility.browser.test.tsx",
             "projectName": "browser (chromium)", "location": {"line": 157, "column": 4}}
            for width in (390, 820, 1440) for name in errors]
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    source = json.loads(subprocess.check_output(["node", "tools/test_report/source_index.mjs", "dashboard"], cwd=BASE, text=True))
    rows = vitest_list(data)
    for row in rows:
        row["stage"] = "ui"
        row["tags"] = source_tags(row, source["tests"])
        assert set(row["tags"]) == {"a11y:keyboard", "a11y:focus", "display:viewport", "display:present", "transition:back"}
    targets = {"error:" + name: {"group": "error", "source": name} for name in errors.values()}
    matrix, unclassified = build_matrix(rows, targets, config)
    assert unclassified == []
    for name, target in errors.items():
        expected = [row for row in rows if f"{name} エラーが収まり" in row["name"]]
        assert len(expected) == 3
        for tag in ("display:present", "transition:back", "a11y:keyboard", "a11y:focus"):
            assert matrix["error:" + target, tag]["tests"] == expected
    (tmp_path / "ui.list.json").write_text(json.dumps(data))
    output = tmp_path / "frontend.md"
    table = tmp_path / "tests.csv"
    main(["--offline", "--input-dir", str(tmp_path), "--output", str(output), "--csv", str(table)])
    report = output.read_text()
    assert "コンポーネント（story・Browser Mode） | 1 | 9" in report
    assert "未分類のテストは 0 件である。" in report
    assert_csv_match_markdown(report, tmp_path)
    assert len(report.splitlines()) < 200, "the Markdown is a summary; details live in the CSV files"
    header, *body = read_csv(table)
    assert header == CSV_COLUMNS and len(body) == 9
    assert [row[4] for row in body] == sorted(row["name"] for row in data), "same file and line: sorted by test name"
    first = dict(zip(header, next(row for row in body if row[4] == data[0]["name"])))
    assert first["段階"] == "ui" and first["project"] == "browser (chromium)" and first["行"] == "157"
    assert first["テスト名"] == data[0]["name"]
    assert first["観点"] == "a11y; display; transition"
    assert first["条件"] == "a11y:focus; a11y:keyboard; display:present; display:viewport; transition:back"
    assert "error:GenericError" in first["対象"].split("; ")
    assert first["未分類"] == "いいえ" and first["結果"] == ""
    (tmp_path / "ui.results.json").write_text(json.dumps({"testResults": [{
        "name": "/other/dashboard/src/components/layout/uiCompatibility.browser.test.tsx",
        "assertionResults": [{"ancestorTitles": ["UI at 390 CSS pixels"], "title": data[0]["name"].split(" > ")[1],
                              "status": "failed"}]}]}))
    again = tmp_path / "again.md"
    main(["--offline", "--input-dir", str(tmp_path), "--output", str(again), "--csv", str(table)])
    results = {row[4]: row[-1] for row in read_csv(table)[1:]}
    assert results.pop(data[0]["name"]) == "失敗" and set(results.values()) == {"未実行"}
    rerun = again.read_text()
    assert "コンポーネントは 0 件が通り、失敗 1 件だった。" in rerun
    assert "コンポーネントは一覧の 9 件に対して結果が 1 件で、数が合わない（注記 2）。" in rerun
    assert "失敗した 1 件は `tests.csv` の `結果` を「失敗」に絞ると確かめられる。" in rerun


def test_outputs_are_byte_identical_whatever_the_collection_order(tmp_path):
    """Re-collecting the list can reorder tests; the Markdown and every CSV must keep the same bytes."""
    names = ["generic", "not found", "response"]
    data = [{"name": f"UI at {width} CSS pixels > 画面幅ごとに、{name} エラーが収まりキーボードで復帰できる",
             "file": "/copied/dashboard/src/components/layout/uiCompatibility.browser.test.tsx",
             "projectName": "browser (chromium)", "location": {"line": 157, "column": 4}}
            for width in (390, 820, 1440) for name in names]
    data.append({"file": "/copied/dashboard/src/components/errors/errors.stories.tsx",
                 "name": "汎用エラーのとき、エラー画面を表示する", "projectName": "storybook (chromium)", "location": {"line": 999}})
    outputs = []
    for run, rows in enumerate([data, data[::-1], data[3:] + data[:3], data]):
        directory = tmp_path / str(run)
        directory.mkdir()
        (directory / "ui.list.json").write_text(json.dumps(rows))
        main(["--offline", "--input-dir", str(directory), "--output", str(directory / "frontend.md"),
              "--csv", str(directory / "tests.csv")])
        outputs.append({path.name: path.read_bytes() for path in sorted(directory.iterdir()) if path.suffix in (".md", ".csv")})
    assert set(outputs[0]) == {"frontend.md", *DETAIL_COLUMNS}
    for other in outputs[1:]:
        assert other == outputs[0]
    header, *body = read_csv(tmp_path / "0" / "tests.csv")
    keys = [(row[2], int(row[3]), row[4], row[1]) for row in body]
    assert keys == sorted(keys), "one stage: file, line, test name, project"
    cell = next(row for row in read_csv(tmp_path / "0" / "cases.csv")[1:] if row[0] == "error:GenericError" and row[3] == "a11y:focus")
    assert cell[6].split("\n") == sorted(cell[6].split("\n")), "the tests in a cell follow the same order"


@pytest.mark.parametrize("file,name,expected", [
    ("src/state/questionState.test.ts", "あなた: 年齢: 値が設定されている", ["state:conversion"]),
    ("src/state/questionState.test.ts", "あなた: 年齢: 次の質問が年収", ["transition:forward"]),
    ("src/state/questionState.test.ts", "あなた: 年齢: next->backで元の質問に戻る", ["transition:back"]),
    ("src/state/questionState.test.ts", "新しい名前の型", []),
    ("src/state/convert.test.ts", "未回答のときは省略する", ["state:optional"]),
    ("src/state/convert.test.ts", "年収を換算する", ["state:conversion"]),
    ("src/state/progress.test.ts", "最初の進捗は0", ["state:progress"]),
    ("src/state/progress.test.ts", "新しい名前の型", []),
    ("src/components/result/shareLink.test.ts", "旧形式を読む", ["sharing:legacy"]),
    ("src/components/result/shareLink.test.ts", "往復する", ["sharing:roundtrip"]),
    ("src/new.test.ts", "値が設定されている", []),
])
def test_legacy_classification_is_scoped_and_unknown_names_remain_visible(file, name, expected):
    """Match the existing naming conventions without classifying unrelated files."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    assert classification_tags({"file": file, "name": name}, config) == expected


def test_composition_is_folded_without_descriptions_and_names_undescribed_files(config):
    """Multiple tags in one viewpoint count once; the table folds; descriptions live in frontend_test_note.md."""
    rows = [{"file": "src/age.test.ts", "stage": "unit", "tags": ["input:normal", "input:empty"]}]
    source = {"files": [{"file": "src/age.test.ts", "imports": ["src/age.ts"]},  # noqa: FS003
                        {"file": "src/name.test.ts", "imports": []}]}  # noqa: FS003
    config["test_descriptions"] = {"src/age.test.ts": {"verifies": "年齢を確かめる", "does_not_verify": "実機"}}  # noqa: FS003
    lines = composition_lines(config, rows, source, {})
    text = "\n".join(lines)
    assert "| src/age.test.ts | unit | src/age.ts | 1 | input: 1 |" in lines
    assert "| ファイル | 段階 | 確かめる対象（import） | 件数 | 観点の内訳 |" in lines
    assert "確かめていること |" not in text and "年齢を確かめる" not in text, "the two description columns are dropped"
    assert "`docs/frontend_test_note.md`" in text and "（注記 4）" in text and "`test_descriptions`" not in text, \
        "the YAML key is named in the note, not in the sentence"
    assert lines[2].startswith("テストは 2 ファイルにある。件数が多いのは `src/age.test.ts`（1）である。説明のないファイルが 1 ある: `src/name.test.ts`。")
    # GitHub and VS Code render Markdown inside <details> only with blank lines around it.
    start, end = lines.index("<details>"), lines.index("</details>")
    assert lines[start + 1] == "<summary>テストのファイル 2・テスト 1 件（ファイルごとの段階・import・件数・観点の内訳）</summary>"
    assert lines[start + 2] == "" and lines[end - 1] == "" and lines[end + 1] == ""
    assert all(line.startswith("|") for line in lines[start + 3:end - 1])
    assert lines.index("| 全体の受け持ち | 段階 | 範囲 |") > end, "the short responsibilities table stays open"
    unavailable = composition_lines(config, rows, source, {"unit": "unavailable"})
    assert "| src/age.test.ts | unit | src/age.ts | 未取得 | 未取得 |" in unavailable
    assert "テスト 1 件（一覧未取得の段階あり）" in "\n".join(unavailable)


def test_coverage_combines_stages_and_omits_exclusions_and_unknown_metrics(config):
    """A strong unit result must not become a UI-only gap; excluded files stay out."""
    def metrics(value):
        return {key: metric(value) for key in ("statements", "branches", "functions", "lines")}

    coverage = {"unit": {"strong.ts": metrics(95), "weak.ts": metrics(20), "excluded.ts": metrics(0)},
                "ui": {"strong.ts": metrics(0), "weak.ts": metrics(30), "excluded.ts": metrics(0)}}
    config["exclusions"] = [{"target": "file:excluded.ts", "cells": ["*"], "reason": "entry"}]
    low, zero = coverage_gaps(coverage, config, 80)
    assert len(low) == 1 and low[0].startswith("weak.ts (statements=30%")
    assert zero == []
    for metric_row in coverage["ui"]["weak.ts"].values():
        metric_row["pct"] = "Unknown"
    assert coverage_gaps(coverage, config, 80) == ([], [])
    coverage["ui"] = None
    assert coverage_gaps(coverage, config, 80) == ([], [])


def test_transition_evidence_requires_matching_fingerprint():
    """Stale execution must never count as covered; distinct guarded alternatives survive."""
    machine = {"fingerprint": "current", "probes": 3, "sampled": 2, "representatives": {}, "transitions": [
        {"id": "age / next / 0", "target": "income", "guarded": True},
        {"id": "age / next / 1", "target": "result", "guarded": False}]}
    trace = {"fingerprint": "old", "tests": {"age / next / 0": ["forward test"]}}
    stale = "\n".join(transition_lines(machine, trace))
    assert "| 2 | 0 | 0 | 2 |" in stale and "版が違うため、どれを通ったかは分からない。記録の取り直し方は注記 6。" in stale
    assert "通過の記録がないため" in "\n".join(transition_lines(machine, None))
    assert [row[6] for row in transition_rows(machine, trace)] == ["判定不能", "判定不能"]
    trace["fingerprint"] = "current"
    text = "\n".join(transition_lines(machine, trace))
    assert "| 2 | 1 | 1 | 0 |" in text and "transitions.csv" in text
    rows = transition_rows(machine, trace)
    assert [(row[6], row[7]) for row in rows] == [("通過", "forward test"), ("未通過", "")]


def test_error_width_cases_and_rerender_have_matrix_bindings():
    """Each-expanded error titles and the nameless age rerender must fill real cells."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    targets = {"error:" + name: {"group": "error", "source": name} for name in ["GenericError", "NotFoundError", "FormResponseError"]}
    targets["template:ageQuestionTemplate"] = {"group": "template", "source": "age"}
    rows = [{"file": "src/components/layout/uiCompatibility.browser.test.tsx", "name": f"画面幅ごとに、{name} エラーが収まりキーボードで復帰できる", "project": "browser", "tags": ["display:present", "a11y:keyboard", "a11y:focus", "transition:back"]}
            for name in ["generic", "not found", "response"]]
    rows.append({"file": "src/components/questions/template/questionTemplates.test.tsx", "name": "再描画したとき、前の回答とDOMを引き継がない", "project": "unit", "tags": ["input:normal"]})
    assert build_matrix(rows, targets, config)[1] == []


def test_machine_graph_keeps_automatic_and_guarded_alternatives_and_representatives():
    """Extract the actual machine, retaining all declarations beyond representative probes."""
    graph = json.loads(subprocess.check_output(["node", "tools/test_report/machine_graph.cjs"], cwd=BASE, text=True))
    edges = graph["transitions"]
    assert len({edge["id"] for edge in edges}) == len(edges)
    assert any(edge["source"] == "history" and edge["event"] == "always" for edge in edges)
    assert any(edge["source"] == "年齢" and edge["guarded"] for edge in edges)
    assert any(edge["source"] == "年齢" and edge["target"] == "年齢" for edge in edges)
    assert graph["sampled"] > 0 and graph["probes"] >= graph["sampled"]
    values = graph["representatives"]
    assert {row.get("selection") for row in values["配偶者はいますか？"]} == {False, True, None}
    assert {row.get("selection") for row in values["子どもの人数"]} == {0, 1, 2, None}
    assert len(values["見積もりモード"]) == 4


def test_frontend_test_note_region_matches_definitions(tmp_path):
    """Regenerating docs/frontend_test_note.md from the YAML must leave the checked-in file unchanged."""
    note = BASE / "docs/frontend_test_note.md"
    copied = tmp_path / "frontend_test_note.md"
    copied.write_text(note.read_text(encoding="utf-8"), encoding="utf-8")
    main(["--write-test-note", "--test-note", str(copied), "--input-dir", str(tmp_path)])
    assert copied.read_text(encoding="utf-8") == note.read_text(encoding="utf-8"), \
        "docs/frontend_test_note.md is stale: run python tools/test_report/report.py --write-test-note"


def test_frontend_test_note_features_cover_every_description():
    """Every described test file appears under a feature, with its layer and both descriptions."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    text = "\n".join(feature_lines(config, BASE / "dashboard"))
    for file, row in config["test_descriptions"].items():
        assert f"| {layer_of(file)} | `dashboard/{file}` | " in text
        assert f" | {row['verifies']} | {row['does_not_verify']} |" in text
    for feature in config["features"]:
        assert "### " + feature["name"] in text


def test_frontend_test_note_features_are_app_features_with_conclusions():
    """Features carry both conclusions; qualities stay a separate axis and are not features."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    quality_names = {row["name"] for row in config["qualities"]}
    assert {row["id"] for row in config["qualities"]} == {"compatibility", "a11y", "visual", "journey"}
    names = [feature["name"] for feature in config["features"]]
    assert not quality_names & set(names)
    text = "\n".join(feature_lines(config, BASE / "dashboard"))
    for feature in config["features"]:
        section = text.split("### " + feature["name"] + "\n", 1)[1]
        assert section.lstrip().startswith("- **保証していること**: ")
        assert "- **保証していないこと（テストが通っても本番で起こりうること）**: " in section.split("根拠のファイル", 1)[0]
    assert "| 機能 | 振る舞い | " + " | ".join(row["name"] for row in config["qualities"]) + " |" in text


def test_frontend_test_note_region_shows_visible_start_and_finish():
    """Visible lines open and close the region; the opening names the last feature as its end."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    lines = feature_lines(config, BASE / "dashboard")
    last = config["features"][-1]["name"]
    assert lines[0] == note_start(last) and lines[-1] == NOTE_FINISH
    assert f"「{last}」の節まで" in lines[0]
    assert "tools/test_report/viewpoints.yaml" in lines[0] and NOTE_COMMAND in lines[0] and "手で直さない" in lines[0]
    assert "ここまで" in NOTE_FINISH and "人が書く" in NOTE_FINISH
    assert all(line.startswith(">") for line in (lines[0], lines[-1])), "must render in a Markdown preview"
    headings = [line[4:] for line in lines if line.startswith("### ")]
    assert headings[0] == "品質の観点" and headings[-1] == last
    region = (BASE / "docs/frontend_test_note.md").read_text(encoding="utf-8").split(NOTE_BEGIN, 1)[1].split(NOTE_END, 1)[0]
    body = region.strip().splitlines()
    assert body[0] == note_start(last) and body[-1] == NOTE_FINISH
    more = copy.deepcopy(config)
    more["features"].append(dict(more["features"][0], name="追加の機能"))
    more["features"][0]["files"] = more["features"][0]["files"][:1]
    added = feature_lines(more, BASE / "dashboard")
    assert "「追加の機能」の節まで" in added[0] and added[-1] == NOTE_FINISH


def test_frontend_test_note_rejects_drift_and_rewrites_only_the_region(tmp_path):
    """Unassigned descriptions, unknown files and broken markers are errors; text outside stays."""
    (tmp_path / "src").mkdir()
    (tmp_path / "src/age.test.ts").write_text("")
    (tmp_path / "src/age.browser.test.tsx").write_text("")
    config = {"test_descriptions": {"src/age.test.ts": {"verifies": "a|b", "does_not_verify": "c"},  # noqa: FS003
                                    "src/age.browser.test.tsx": {"verifies": "d", "does_not_verify": "e"}},  # noqa: FS003
              "qualities": [{"id": "a11y", "name": "a11y", "description": "キー"}],
              "features": [{"name": "入力欄", "guarantees": "値を保つ。\n  復元する。", "risks": "実機は見ない。",
                            "files": ["src/age.test.ts",  # noqa: FS003
                                      {"file": "src/age.browser.test.tsx", "qualities": ["a11y"]}]}],  # noqa: FS003
              "responsibilities": []}
    lines = feature_lines(config, tmp_path)
    assert "| 単体 | `dashboard/src/age.test.ts` | 振る舞い | a\\|b | c |" in lines
    assert "| Browser Mode | `dashboard/src/age.browser.test.tsx` | a11y | d | e |" in lines
    assert "| 入力欄 | 単体 | Browser Mode |" in lines
    assert "- **保証していること**: 値を保つ。復元する。" in lines
    bad = copy.deepcopy(config)
    bad["features"][0]["files"][1]["qualities"] = ["speed"]
    with pytest.raises(ValueError, match="Unknown quality"):
        feature_lines(bad, tmp_path)
    bad = copy.deepcopy(config)
    del bad["features"][0]["risks"]
    with pytest.raises(ValueError, match="guarantees, risks"):
        feature_lines(bad, tmp_path)
    config["features"][0]["files"] = ["src/age.test.ts"]  # noqa: FS003
    del config["test_descriptions"]["src/age.browser.test.tsx"]
    text = f"before\n{NOTE_BEGIN}\nold\n{NOTE_END}\nafter\n"
    replaced = replace_note_region(text, lines)
    assert replaced.startswith("before\n" + NOTE_BEGIN) and replaced.endswith(NOTE_END + "\nafter\n")
    assert "old" not in replaced
    assert replace_note_region(replaced, lines) == replaced
    with pytest.raises(ValueError, match="one"):
        replace_note_region("before\n" + NOTE_BEGIN + "\n", lines)
    config["test_descriptions"]["src/new.test.ts"] = {"verifies": "x", "does_not_verify": "y"}  # noqa: FS003
    with pytest.raises(ValueError, match="without a feature"):
        feature_lines(config, tmp_path)
    config["features"][0]["files"].append("src/new.test.ts")  # noqa: FS003
    with pytest.raises(ValueError, match="missing"):
        feature_lines(config, tmp_path)
    config["features"][0]["files"] = ["src/other.test.ts"]  # noqa: FS003
    with pytest.raises(ValueError, match="no test_descriptions"):
        feature_lines(config, tmp_path)
    layers = [layer_of(file) for file in ("e2e/visual/a.spec.ts", "e2e/a.spec.ts", "src/a.stories.tsx", "src/a.browser.test.tsx")]
    assert layers == ["見た目の比較", "E2E", "story", "Browser Mode"]


def definitions():
    """The checked-in definitions, read the way report.py reads them."""
    return yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text(encoding="utf-8"))


def test_unit_results_are_taken_with_the_trace_config():
    """One unit run gives both results and transition evidence, so the documented and shown commands agree."""
    stage = next(stage for stage in definitions()["stages"] if stage["id"] == "unit")
    assert stage["run"] == TRACE_RUN
    readme = (BASE / "tools/test_report/README.md").read_text(encoding="utf-8")
    steps = readme.split("## 実行結果と網羅率の追加", 1)[1].split("\n## ", 1)[0]
    assert TRACE_RUN in steps and "npm run test -- --reporter" not in steps
    trace_section = readme.split("## 状態機械の分岐と通過の記録", 1)[1].split("\n## ", 1)[0]
    assert "trace.config.mjs --reporter" not in trace_section and "「実行結果と網羅率の追加」" in trace_section


def test_definitions_follow_schema_and_are_documented():
    """The YAML passes the shape check; every key is in the schema, the README and a YAML comment."""
    text = (BASE / "tools/test_report/viewpoints.yaml").read_text(encoding="utf-8")
    lines = text.splitlines()
    assert lines[0] == "# yaml-language-server: $schema=./viewpoints.schema.json"
    config = definitions()
    check_shape(config)
    schema = load_schema()
    assert list(schema["properties"]) == list(config)
    readme = (BASE / "tools/test_report/README.md").read_text(encoding="utf-8").split("## `viewpoints.yaml` の構成", 1)[1]
    for key, rule in schema["properties"].items():
        assert rule["description"], key
        assert f"### `{key}`" in readme, key
        start = next(index for index, line in enumerate(lines) if line.startswith(key + ":"))
        assert lines[start - 1].startswith("# "), key

    def objects(node):
        """Every object schema with named properties, so unknown keys cannot slip through."""
        if "properties" in node:
            yield node
        children = [node.get("items"), node.get("additionalProperties"), *node.get("oneOf", []), *node.get("properties", {}).values()]
        for child in children:
            if isinstance(child, dict):
                yield from objects(child)

    assert all(node.get("additionalProperties") is False for node in objects(schema))


def drop(config, path):
    """Delete the last key of a path such as ("stages", 0, "run")."""
    for key in path[:-1]:
        config = config[key]
    del config[path[-1]]


@pytest.mark.parametrize("change, expected", [
    (lambda c: c.update(viewpoint={}), "(root): unknown key 'viewpoint'"),
    (lambda c: c["stages"][1].update(comand=["x"]), "(root).stages[1]: unknown key 'comand'"),
    (lambda c: drop(c, ("exclusions", 0, "reason")), "(root).exclusions[0]: missing required key 'reason'"),
    (lambda c: drop(c, ("bindings",)), "(root): missing required key 'bindings'"),
    (lambda c: c["viewpoints"]["input"].update(conditions="normal"), "(root).viewpoints.input.conditions: expected array, got string"),
    (lambda c: c["stages"][0].update(projects=[]), "(root).stages[0].projects: needs at least 1 item(s)"),
    (lambda c: c["file_cells"]["src/state/convert.ts"].append("state"), "(root).file_cells['src/state/convert.ts'][2]: 'state' does not match"),
    (lambda c: c["viewpoints"].update(Input=c["viewpoints"]["input"]), "(root).viewpoints.Input: key 'Input' does not match"),
    (lambda c: c["features"][0]["files"].append({"file": "e2e/Homepage.spec.ts"}), "(root).features[0].files[4]: missing required key 'qualities'"),
    (lambda c: c["features"][0]["files"].append(3), "(root).features[0].files[4]: must match exactly one allowed form"),
    (lambda c: c["test_descriptions"]["e2e/Homepage.spec.ts"].update(verifies=""),
     "(root).test_descriptions['e2e/Homepage.spec.ts'].verifies: must not be empty"),
    (lambda c: c.update(version=2), "(root).version: must be one of [1]"),
    ])
def test_shape_errors_name_the_key_path(change, expected):
    """Unknown keys, missing items and wrong types stop with the path of the offending key."""
    config = definitions()
    change(config)
    with pytest.raises(ValueError) as error:
        check_shape(config)
    assert expected in str(error.value)


def test_cli_checks_shape_before_reading_tests(tmp_path):
    """A typo in the definitions fails before collection, tag or note generation."""
    config = definitions()
    config["bindings"][0]["target"] = config["bindings"][0].pop("targets")
    broken = tmp_path / "viewpoints.yaml"
    broken.write_text(yaml.safe_dump(config, allow_unicode=True), encoding="utf-8")
    with pytest.raises(ValueError, match=r"\(root\)\.bindings\[0\]: unknown key 'target'"):
        main(["--write-tags", "--definitions", str(broken), "--input-dir", str(tmp_path)])


def test_checker_applies_every_schema_keyword(tmp_path):
    """The checker reads the schema itself; a keyword it would ignore is rejected, so the two cannot drift."""
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    used = set()

    def visit(node):
        """Collect keywords; the keys under properties and definitions are names, not keywords."""
        used.update(node)
        for keyword, value in node.items():
            children = value.values() if keyword in ("properties", "definitions") else value if isinstance(value, list) else [value]
            for child in children:
                if isinstance(child, dict):
                    visit(child)

    visit(schema)
    assert used - {"$schema", "$id", "title", "description", "definitions"} <= SCHEMA_RULES
    for bad, message in (({"anyOf": []}, "Unsupported schema keyword"), ({"type": "number"}, "Unsupported schema type"),
                         ({"$ref": "#/definitions/text", "description": "x"}, "must be alone")):
        changed = copy.deepcopy(schema)
        changed["properties"]["version"] = bad
        path = tmp_path / "schema.json"
        path.write_text(json.dumps(changed), encoding="utf-8")
        with pytest.raises(ValueError, match=message):
            load_schema(path)

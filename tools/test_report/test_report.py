"""Test report adapters and gap accounting with small, isolated inputs."""

import copy
import json
import subprocess

import pytest
from tools.test_report.report import (
    BASE,
    build_matrix,
    check_definitions,
    classification_tags,
    collect,
    composition_lines,
    coverage_gaps,
    coverage_rows,
    extract_targets,
    feature_lines,
    layer_of,
    main,
    NOTE_BEGIN,
    NOTE_END,
    playwright_tests,
    read_json,
    render,
    replace_note_region,
    result_counts,
    source_tags,
    transition_lines,
    vitest_list,
    )
import yaml


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
    text = render(config, [row], targets, matrix, unknown, {"unit": None}, {"unit": coverage, "ui": copy.deepcopy(coverage)}, {}, 80)
    assert "未実行" in text
    assert "理由のない空きのます（2）" in text
    assert "未分類のテスト（1）" in text
    assert "a&#124;b&#95;&lt;script&gt;" in text
    assert "### unit" in text and "### ui" in text
    assert "### unit と UI の両方で 0%" in text
    assert "- src/age.ts" in text
    assert "branches=0%" in text
    assert text.splitlines().count("### 網羅率が低いファイル") == 1
    headings = ["## テストの構成", "## 概要", "## 観点×条件", "## テストの状況", "## 網羅率", "## 不足しているテスト"]
    assert [text.index(heading) for heading in headings] == sorted(text.index(heading) for heading in headings)
    assert "確かめ方の強さ" in text


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
    main(["--offline", "--input-dir", str(tmp_path), "--output", str(output)])
    report = output.read_text()
    assert "コンポーネント（story・Browser Mode） | 1 | 1" in report
    assert "ui / storybook (chromium) / 汎用エラー" in report
    assert "未分類のテスト（0）" in report
    assert "一覧未取得（unit）" in report


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
    main(["--offline", "--input-dir", str(tmp_path), "--output", str(output)])
    report = output.read_text()
    assert "コンポーネント（story・Browser Mode） | 1 | 9" in report
    assert "未分類のテスト（0）" in report
    assert report.splitlines().count("### 網羅率が低いファイル") == 1


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


def test_composition_imports_counts_descriptions_and_missing_explanation(config):
    """Multiple tags in one viewpoint count once; undocumented files remain visible."""
    rows = [{"file": "src/age.test.ts", "stage": "unit", "tags": ["input:normal", "input:empty"]}]
    source = {"files": [{"file": "src/age.test.ts", "imports": ["src/age.ts"]}]}
    text = "\n".join(composition_lines(config, rows, source, {}))
    assert "src/age.ts | 1 | input: 1 | 説明なし | 説明なし" in text
    assert "src/age.ts | 未取得" in "\n".join(composition_lines(config, rows, source, {"unit": "unavailable"}))


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
    assert "テストが通した遷移: 未取得" in "\n".join(transition_lines(machine, trace))
    trace["fingerprint"] = "current"
    text = "\n".join(transition_lines(machine, trace))
    assert "テストが通した遷移: 1 / 通していない遷移: 1" in text
    assert "forward test" in text and "未通過" in text


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


def test_test_note_region_matches_definitions(tmp_path):
    """Regenerating docs/test_note.md from the YAML must leave the checked-in file unchanged."""
    note = BASE / "docs/test_note.md"
    copied = tmp_path / "test_note.md"
    copied.write_text(note.read_text(encoding="utf-8"), encoding="utf-8")
    main(["--write-test-note", "--test-note", str(copied), "--input-dir", str(tmp_path)])
    assert copied.read_text(encoding="utf-8") == note.read_text(encoding="utf-8"), \
        "docs/test_note.md is stale: run python tools/test_report/report.py --write-test-note"


def test_test_note_features_cover_every_description():
    """Every described test file appears under a feature, with its layer and both descriptions."""
    config = yaml.safe_load((BASE / "tools/test_report/viewpoints.yaml").read_text())
    text = "\n".join(feature_lines(config, BASE / "dashboard"))
    for file, row in config["test_descriptions"].items():
        assert f"| {layer_of(file)} | `dashboard/{file}` | {row['verifies']} | {row['does_not_verify']} |" in text
    for feature in config["features"]:
        assert "### " + feature["name"] in text


def test_test_note_rejects_drift_and_rewrites_only_the_region(tmp_path):
    """Unassigned descriptions, unknown files and broken markers are errors; text outside stays."""
    (tmp_path / "src").mkdir()
    (tmp_path / "src/age.test.ts").write_text("")
    config = {"test_descriptions": {"src/age.test.ts": {"verifies": "a|b", "does_not_verify": "c"}},  # noqa: FS003
              "features": [{"name": "入力欄", "files": ["src/age.test.ts"]}],  # noqa: FS003
              "responsibilities": []}
    lines = feature_lines(config, tmp_path)
    assert "| 単体 | `dashboard/src/age.test.ts` | a\\|b | c |" in lines
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

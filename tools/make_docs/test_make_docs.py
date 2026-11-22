"""制度ドキュメントの表示を検証する。実行: python -m unittest discover -s tools/make_docs。"""

import subprocess
import sys
import tempfile
import unittest

from openfisca_core.parameters import ParameterNode
from tools.make_docs.make_docs import build_parameter_entries, format_number, format_parameter_value


class FormatNumberTest(unittest.TestCase):
    """単位付き表示と、既存の単位なし表示の回帰を検証する。"""

    def test_percentages(self):
        cases = [
            (0.183, "18.3%"),
            (0.0055, "0.55%"),
            (0.1, "10%"),
            (0.29, "29%"),
            (0, "0%"),
            (1, "100%"),
            (1.0, "100%"),
            (-0.0055, "-0.55%"),
            (0.00000001, "0.000001%"),
            ]
        for number, expected in cases:
            with self.subTest(number=number):
                self.assertEqual(format_number(number, "/1"), expected)

    def test_units_and_existing_formats(self):
        cases = [
            (20, "year", "20 歳"),
            (20.0, "year", "20 歳"),
            (30, "day", "30 日"),
            (3, "人", "3 人"),
            (12, "学年", "12 学年"),
            (1234, "currency-JPY", "1,234 円"),
            (1234.0, "currency-JPY", "1,234 円"),
            (1234.5, "currency-JPY", "1,234.5 円"),
            (0.5, "currency-JPY", "0.5 円"),
            (1234, None, "1,234"),
            (62.0, None, "62"),
            (1.5, "unknown", "1.5"),
            (True, "/1", "はい"),
            (False, "year", "いいえ"),
            ("対象", "year", "対象"),
            ]
        for number, unit, expected in cases:
            with self.subTest(number=number, unit=unit):
                self.assertEqual(format_number(number, unit), expected)

    def test_lists_and_discontinued_values(self):
        self.assertEqual(format_parameter_value([0.183, 0.0055, 0.1], "/1"), "18.3% / 0.55% / 10%")
        self.assertEqual(format_parameter_value([20, 30], "year"), "20 歳 / 30 歳")
        self.assertEqual(format_parameter_value(None, "year"), "（適用なし）")


class ParameterUnitsTest(unittest.TestCase):
    """単位不足の警告と、生成データへの表示の反映を検証する。"""

    def test_missing_units_warn_once_per_parameter(self):
        node = ParameterNode("test", data={
            "nested": {
                "history": {"values": {"2026-01-01": None, "2025-01-01": 20}},
                "array": {"metadata": {"unit": ""}, "values": {"2026-01-01": [1, 2]}},
                },
            "number": {"values": {"2026-01-01": 0, "2025-01-01": 1.5}},
            "boolean": {"values": {"2026-01-01": True}},
            "none": {"values": {"2026-01-01": None}},
            "flags": {"values": {"2026-01-01": [True, False]}},
            "with_unit": {"metadata": {"unit": "/1"}, "values": {"2026-01-01": 0.183}},
            })
        with self.assertLogs("tools.make_docs.make_docs", level="WARNING") as logs:
            entries = build_parameter_entries(node)
        self.assertEqual(len(logs.records), 1)
        self.assertEqual(logs.records[0].getMessage(), (
            "単位のない数値パラメータ (3件):\n"
            "test.nested.array\ntest.nested.history\ntest.number"
            ))
        self.assertEqual(len(entries), 7)

    def test_complete_units_generate_displays_without_warnings(self):
        node = ParameterNode("test", data={
            "rate": {"metadata": {"unit": "/1"}, "values": {"2026-01-01": 0.183, "2025-01-01": 0.0055}},
            "age": {"metadata": {"unit": "year"}, "values": {"2026-01-01": [20, 30]}},
            "days": {"metadata": {"unit": "day"}, "values": {"2026-01-01": 30}},
            "grade": {"metadata": {"unit": "学年"}, "values": {"2026-01-01": 12}},
            })
        with self.assertNoLogs("tools.make_docs.make_docs", level="WARNING"):
            entries = {entry["name"]: entry for entry in build_parameter_entries(node)}
        self.assertEqual(entries["test.rate"]["latest"]["display"], "18.3%")
        self.assertEqual(entries["test.rate"]["values"][1]["display"], "0.55%")
        self.assertEqual(entries["test.age"]["latest"]["display"], "20 歳 / 30 歳")
        self.assertEqual(entries["test.days"]["latest"]["display"], "30 日")
        self.assertEqual(entries["test.grade"]["latest"]["display"], "12 学年")

    def test_cli_warns_to_stderr_and_continues_generating(self):
        source = (
            "from openfisca_core.parameters import ParameterNode\n"
            "from tools.make_docs import make_docs\n"
            "system = make_docs.CountryTaxBenefitSystem()\n"
            "system.parameters.add_child('unit_test', ParameterNode('unit_test', data={\n"
            "    'missing': {'values': {'2026-01-01': 20}},\n"
            "}))\n"
            "make_docs.CountryTaxBenefitSystem = lambda: system\n"
            "make_docs.main()\n"
            )
        with tempfile.TemporaryDirectory() as output_dir:
            result = subprocess.run(
                [sys.executable, "-c", source, "--output-dir", output_dir],
                capture_output=True, text=True, check=True,
                )
        self.assertEqual(result.stdout, "")
        self.assertIn("単位のない数値パラメータ (1件):\nunit_test.missing\n", result.stderr)
        self.assertIn("parameters.yml (Parameter ", result.stderr)


if __name__ == "__main__":
    unittest.main()

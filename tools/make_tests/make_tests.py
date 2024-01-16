"""
テスト条件・結果を記載したCSVファイルから、OpenFisca用のyamlテストファイルを自動生成
"""

import argparse
import logging
import os
import sys

from mylib.utils import TestGenerator


sys.path.append(os.curdir)


if __name__ == "__main__":
    parse = argparse.ArgumentParser()
    parse.add_argument("-d", "--dir", default="../../openfisca_japan/tests/generated", help="output test directory name")
    parse.add_argument("-o", "--name", default="mytests", help="output test file name")
    parse.add_argument("-c", "--target", default="shibuya_zidou_teate", help="specific process class")
    parse.add_argument("-p", "--period", default="2023-06-01", help="period")
    parse.add_argument("-i", "--csv", help="input csv file name")
    args = parse.parse_args()
    generator = TestGenerator(args)
    generator.clean()
    generator.prepare()
    generator.generate()
    logging.info("Done!")

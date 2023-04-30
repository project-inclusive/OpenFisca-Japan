# -*- coding: utf-8 -*-
import argparse
import os
import sys
sys.path.append(os.curdir)
from mylib.utils import TestGenerator

if __name__ == "__main__":
    parse = argparse.ArgumentParser()
    parse.add_argument("-d", "--dir", default="../openfisca_japan/tests/generated", help="output test directory name")
    parse.add_argument("-o", "--name", default="mytests", help="output test file name")
    parse.add_argument("-c", "--target", default="shibuya_zidou_teate", help="specific process class")
    parse.add_argument("-p", "--period", default="2023-06-01", help="period")
    parse.add_argument("-i", "--csv", help="input csv file name")
    args = parse.parse_args()
    generator = TestGenerator(args)
    generator.clean()
    generator.prepare()
    generator.generate()
    print("Done!")

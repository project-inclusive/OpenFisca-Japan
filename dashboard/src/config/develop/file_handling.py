#!/usr/bin/python3.8

import csv
import codecs

import json

# CSVファイルの読み込み
def read_csv(file_name, encoding_format):
	return_list = []
	with open(f'result/{file_name}.csv', 'r', encoding=encoding_format) as f:
		reader = csv.reader(f)
		for row in reader:
			return_list.append(row)
	return return_list

# CSVファイルの書き出し
def make_csv(file_name, output_list, encoding_format):
    codecs.register_error('none', lambda e: ('', e.end))
    with open(f'result/{file_name}.csv', 'w', encoding=encoding_format, errors='none') as f:
        writer = csv.writer(f)
        writer.writerows(output_list)

# JSONファイルの読み込み
def read_json():
    pass

# JSONファイルの書き出し
def make_json():
    pass


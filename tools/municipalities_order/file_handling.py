#!/usr/bin/python3.8

import csv
import codecs

import json

# CSVファイルの読み込み
def read_csv(file_name, encoding_format):
	return_list = []
	with open(f'{file_name}.csv', 'r', encoding=encoding_format) as f:
		reader = csv.reader(f)
		for row in reader:
			return_list.append(row)
	return return_list

# CSVファイルの書き出し
def make_csv(file_name, output_list, encoding_format):
    codecs.register_error('none', lambda e: ('', e.end))
    with open(f'{file_name}.csv', 'w', encoding=encoding_format, errors='none') as f:
        writer = csv.writer(f)
        writer.writerows(output_list)

# JSONファイルの読み込み
def read_json(file_name):
    json_open = open(f'{file_name}.json', 'r')
    json_load = json.load(json_open)
    return json_load

# JSONファイルの書き出し
def make_json(file_name, output_dict):
    with open(f'{file_name}.json', 'w') as f:
        json.dump(output_dict, f, indent=2, ensure_ascii=False)



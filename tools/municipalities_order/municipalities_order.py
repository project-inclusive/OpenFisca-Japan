#!/usr/bin/python3.8

import pandas as pd
from pandas import DataFrame

import file_handling

# ファイルパス
PREF_CSV_PATH = 'csv/都道府県'
CITY_CSV_PATH = 'csv/市町村'
CITY_JSON_PATH = '../都道府県市区町村'
RESULT = 'result/都道府県市区町村_50音順'

# ファイルの読み込み
pref_csv = file_handling.read_csv(PREF_CSV_PATH, 'utf_8')
city_csv = file_handling.read_csv(CITY_CSV_PATH, 'utf_8')
city_dict = file_handling.read_json(CITY_JSON_PATH)

pref_list = [pref_csv[i+1][1] for i in range(47)]
ruby_dict = {}

output_dict = {}

# 都道府県ごとに
line_count = 1
for i in range(47):
    # city_csvを都道府県ごとに分割して辞書にまとめる
    ruby_dict[pref_list[i]] = []
    while line_count < len(city_csv) and city_csv[line_count][1] == pref_list[i]:
        if city_csv[line_count][4] == '':
            ruby_dict[pref_list[i]].append(
                [city_csv[line_count][2], city_csv[line_count][3]])
        else:
            ruby_dict[pref_list[i]].append(
                [city_csv[line_count][4], city_csv[line_count][5]])
        line_count += 1

# 都道府県ごとに
for i in range(47):
    pref_name = pref_list[i]
    city_df = DataFrame(city_dict[pref_name], columns = ['city'])
    ruby_df = DataFrame(ruby_dict[pref_name], columns = ['city', 'ruby'])
    
    # JSONに含まれる市町村名とそのふりがなのdfをマージ
    city_ruby_df = pd.merge(city_df, ruby_df, on = 'city', how = 'left')

    # ふりがなでソート
    city_ruby_df = city_ruby_df.sort_values('ruby')

    # 市町村名のみの配列に変換し、書き出し用の辞書に追加
    output_dict[pref_name] = city_ruby_df['city'].values.tolist()


# JSONの書き出し
file_handling.make_json(RESULT, output_dict)

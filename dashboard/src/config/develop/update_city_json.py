#!/usr/bin/python3.8

import file_handling

# ファイルパス
PREF_CSV_PATH = 'csv/都道府県'
CITY_CSV_PATH = 'csv/市町村'
PREF_JSON_PATH = '../都道府県市区町村'
RESULT = 'result/都道府県市区町村_'

# ファイルの読み込み
pref_csv = file_handling.read_csv(PREF_CSV_PATH, 'utf_8')
city_csv = file_handling.read_csv(CITY_CSV_PATH, 'utf_8')
pref_dict = file_handling.read_json(PREF_JSON_PATH)

pref_list = [pref_csv[i+1][1] for i in range(47)]
ruby_dict = {}

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

'''
# 都道府県ごとに
for i in range(47):
    # JSONに含まれる市町村名とそのふりがなのセットを作成（形式要検討）

    # ふりがなでソート

    # 市町村名のみの配列に変換

    # 書き出し用の辞書の配列を更新


# JSONの書き出し
'''


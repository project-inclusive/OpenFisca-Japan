#!/usr/bin/python3.8

import file_handling

# ファイルパス
PREF_CSV_PATH = ''
CITY_CSV_PATH = ''
PREF_JSON_PATH = ''

# ファイルの読み込み
pref_csv = file_handling.read_csv(PREF_CSV_PATH, 'utf-8')
city_csv = file_handling.read_csv(CITY_CSV_PATH, 'utf-8')
pref_dict = file_handling.read_json(PREF_JSON_PATH)

# 都道府県ごとに
for i in range(47):
    # city_csvを都道府県ごとに分割


# 都道府県ごとに
for i in range(47):
    # JSONに含まれる市町村名とそのふりがなのセットを作成（形式要検討）

    # ふりがなでソート

    # 市町村名のみの配列に変換

    # 書き出し用の辞書の配列を更新

# JSONの書き出し

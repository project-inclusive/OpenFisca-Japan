"""
市区町村データのJSONファイルを生成
"""

import json
import logging

import pandas as pd
from pandas import DataFrame


def read_json(file_name):
    """
    jsonファイルを読み込み
    """
    with open(file_name, "r") as json_open:
        json_load = json.load(json_open)
        return json_load


def export_json(file_name, output_dict):
    """
    jsonファイルに出力
    """
    with open(file_name, "w") as f:
        json.dump(output_dict, f, indent=2, ensure_ascii=False)


# ファイルパス
PREF_CSV_PATH = "csv/都道府県"
MUNIC_CSV_PATH = "csv/市町村"
MUNIC_JSON_PATH = "../../dashboard/src/config/都道府県市区町村"
RESULT = "result/都道府県市区町村_50音順"

# ファイルの読み込み
pref_csv = pd.read_csv(f"{PREF_CSV_PATH}.csv")
munic_csv = pd.read_csv(f"{MUNIC_CSV_PATH}.csv")
munic_json = read_json(f"{MUNIC_JSON_PATH}.json")


pref_df = pref_csv[["都道府県"]]
ruby_dict = {}

output_dict = {}

# munic_csvの市区町村がNaNだったら政令市･郡･支庁･振興局等を参照して埋める
munic_csv = munic_csv[["都道府県", "政令市･郡･支庁･振興局等", "市区町村", "政令市･郡･支庁･振興局等（ふりがな）", "市区町村（ふりがな）"]]
munic_csv = munic_csv.fillna(method="ffill", axis=1)

# 都道府県ごとに
for i in range(47):
    pref_name = str(pref_df[i:i + 1]["都道府県"]).split("    ")[1].split("\n")[0]

    # munic_csvから該当都道府県の行を抽出し、必要な列だけにする
    ruby_df = munic_csv[munic_csv["都道府県"] == pref_name][["市区町村", "市区町村（ふりがな）"]]

    # munic_jsonの該当都道府県のリストをmunic_dfに変換
    munic_df = DataFrame(munic_json[pref_name], columns = ["市区町村"])

    # JSONに含まれる市町村名とそのふりがなのdfをマージ
    munic_ruby_df = pd.merge(munic_df, ruby_df, on = "市区町村", how = "left")

    # ふりがなでソート
    munic_ruby_df = munic_ruby_df.sort_values("市区町村（ふりがな）")

    logging.info(f"{munic_ruby_df}\n")

    # 市町村名のみの配列に変換し、書き出し用の辞書に追加
    output_dict[pref_name] = munic_ruby_df["市区町村"].values.tolist()

# JSONの書き出し
export_json(f"{RESULT}.json", output_dict)

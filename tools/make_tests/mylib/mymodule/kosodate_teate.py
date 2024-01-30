"""
子育て支援制度・手当のテストデータを生成
"""

import os
import sys

from .process_base import AgeGakunenError
from .process_base import ProcessBase

sys.path.append(os.curdir)


# 子育て支援制度・手当
class Process(ProcessBase):
    def __init__(self, period, titles):
        super().__init__(period, titles)

        # 親と子の名前を定義
        self.myself = "親1"
        self.spouse = "親2"
        self.children = ["第1子", "第2子", "第3子", "第4子", "第5子"]

    def process(self, row):
        res = super().process(row)
        d_input = {
            "世帯": {"親一覧": [], "子一覧": []},
            "世帯員": {}}
        d_output = {"世帯": {}}
        allowance = row[self.titles["対象支援制度"]]
        people = []

        # 入力情報を追加
        # 世帯の一覧属性
        if row[self.titles[f"{self.myself}_年齢"]] or row[self.titles[f"{self.myself}_学年"]]:
            d_input["世帯"]["親一覧"].append(self.myself)
            people.append(self.myself)

        if row[self.titles[f"{self.spouse}_年齢"]] or row[self.titles[f"{self.spouse}_学年"]]:
            d_input["世帯"]["親一覧"].append(self.spouse)
            people.append(self.spouse)

        for p in self.children:
            if row[self.titles[f"{p}_年齢"]] or row[self.titles[f"{p}_学年"]]:
                d_input["世帯"]["子一覧"].append(p)
                people.append(p)

        if row[self.titles["配偶者がいるがひとり親に該当"]] == "する":
            d_input["世帯"]["配偶者がいるがひとり親に該当"] = {self.period: True}

        if self.titles.get("控除後世帯高所得") and row[self.titles["控除後世帯高所得"]]:
            income = int(row[self.titles["控除後世帯高所得"]].replace(",", ""))
            if allowance == "児童手当" or allowance == "障害児福祉手当":
                d_input["世帯"]["控除後世帯高所得"] = {self.period: income}
            elif allowance == "児童扶養手当":
                d_input["世帯"]["児童扶養手当の控除後世帯高所得"] = {self.period: income}
            elif allowance == "特別児童扶養手当" or allowance == "児童育成手当" or allowance == "障害児童育成手当":
                d_input["世帯"]["特別児童扶養手当の控除後世帯高所得"] = {self.period: income}
            else:
                d_input["世帯"]["世帯高所得"] = {self.period: income}

        # 東京都のみの制度
        if allowance == "児童育成手当" or allowance == "障害児童育成手当":
            d_input["世帯"]["居住都道府県"] = {self.period: "東京都"}

        # 世帯員の属性
        for p in people:
            d_input["世帯員"][p] = {}
            p_dict = d_input["世帯員"][p]

            # 年齢と学年が両方記載されている時に例外を発生させる（年齢と学年が食い違っている可能性があるため）
            if row[self.titles[f"{p}_年齢"]] and row[self.titles[f"{p}_学年"]]:
                raise AgeGakunenError

            if row[self.titles[f"{p}_年齢"]]:
                p_dict["誕生年月日"] = self.age2birthday(row[self.titles[f"{p}_年齢"]])
            elif row[self.titles[f"{p}_学年"]]:
                p_dict["誕生年月日"] = self.gakunen2birthday(row[self.titles[f"{p}_学年"]])

            if row[self.titles[f"{p}_身体障害者手帳等級"]]:
                disability = row[self.titles[f"{p}_身体障害者手帳等級"]]
                if disability == "0":
                    p_dict["身体障害者手帳等級"] = "無"
                elif disability == "1":
                    p_dict["身体障害者手帳等級"] = "一級"
                elif disability == "2":
                    p_dict["身体障害者手帳等級"] = "二級"
                elif disability == "3":
                    p_dict["身体障害者手帳等級"] = "三級"
                elif disability == "4":
                    p_dict["身体障害者手帳等級"] = "四級"
                elif disability == "5":
                    p_dict["身体障害者手帳等級"] = "五級"
                elif disability == "6":
                    p_dict["身体障害者手帳等級"] = "六級"
                elif disability == "7":
                    p_dict["身体障害者手帳等級"] = "七級"

            if row[self.titles[f"{p}_療育手帳等級"]]:
                disability = row[self.titles[f"{p}_療育手帳等級"]]
                if disability == "0":
                    p_dict["療育手帳等級"] = "無"
                elif disability == "A":
                    p_dict["療育手帳等級"] = "A"
                elif disability == "B":
                    p_dict["療育手帳等級"] = "B"

            if row[self.titles[f"{p}_愛の手帳等級"]]:
                disability = row[self.titles[f"{p}_愛の手帳等級"]]
                if disability == "0":
                    p_dict["愛の手帳等級"] = "無"
                elif disability == "1":
                    p_dict["愛の手帳等級"] = "一度"
                elif disability == "2":
                    p_dict["愛の手帳等級"] = "二度"
                elif disability == "3":
                    p_dict["愛の手帳等級"] = "三度"
                elif disability == "4":
                    p_dict["愛の手帳等級"] = "四度"

            if row[self.titles[f"{p}_精神障害者保健福祉手帳等級"]]:
                disability = row[self.titles[f"{p}_精神障害者保健福祉手帳等級"]]
                if disability == "0":
                    p_dict["精神障害者保健福祉手帳等級"] = "無"
                elif disability == "1":
                    p_dict["精神障害者保健福祉手帳等級"] = "一級"
                elif disability == "2":
                    p_dict["精神障害者保健福祉手帳等級"] = "二級"
                elif disability == "3":
                    p_dict["精神障害者保健福祉手帳等級"] = "三級"

            if row[self.titles[f"{p}_脳性まひ_進行性筋萎縮症"]]:
                p_dict["脳性まひ_進行性筋萎縮症"] = row[self.titles[f"{p}_脳性まひ_進行性筋萎縮症"]]

            if row[self.titles[f"{p}_内部障害"]]:
                p_dict["内部障害"] = row[self.titles[f"{p}_内部障害"]]

            """
            if self.titles.get(f"{p}_所得") and row[self.titles[f"{p}_所得"]]:
                income = int(row[self.titles[f"{p}_所得"]].replace(",", ""))
                p_dict["所得"] = {self.period: income}
            """

        # 出力情報を追加
        # 正解となる支給額を追加
        max_output = int(row[self.titles["支給額（一意に決まる額 or 最大額）"]].replace(",", ""))
        if allowance == "児童扶養手当" or allowance == "特別児童扶養手当":
            d_output["世帯"][f"{allowance}_最大"] = {self.period: max_output}

            if row[self.titles["支給額（最小額 or 一意に決まる場合は空欄）"]]:
                min_output = int(row[self.titles["支給額（最小額 or 一意に決まる場合は空欄）"]].replace(",", ""))
                d_output["世帯"][f"{allowance}_最小"] = {self.period: min_output}
            else:
                d_output["世帯"][f"{allowance}_最小"] = {self.period: max_output}

        else:
            d_output["世帯"][f"{allowance}"] = {self.period: max_output}

        res["input"] = d_input
        res["output"] = d_output
        return res

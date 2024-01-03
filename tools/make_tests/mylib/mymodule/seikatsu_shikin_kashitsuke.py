"""
生活資金貸付制度のテストデータを生成
"""

import os
import sys

from .process_base import AgeGakunenError
from .process_base import ProcessBase


sys.path.append(os.curdir)


# 生活福祉資金貸付制度
class Process(ProcessBase):
    def __init__(self, period, titles):
        super().__init__(period, titles)

        # 親と子の名前を定義
        self.myself = "親1"
        self.spouse = "親2"
        self.children = ["第1子"]

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

        d_input["世帯"]["住民税非課税世帯"] = row[self.titles["住民税非課税世帯"]] == "TRUE"

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

        # 出力情報を追加
        # 正解となる貸付上限額を追加
        max_output = int(row[self.titles["貸付上限額（一意に決まる額 or 最大額）"]].replace(",", ""))
        d_output["世帯"][f"{allowance}"] = {self.period: max_output}

        res["input"] = d_input
        res["output"] = d_output
        return res

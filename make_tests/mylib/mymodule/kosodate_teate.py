# -*- coding: utf-8 -*-
import os
import sys
sys.path.append(os.curdir)
from .process_base import ProcessBase


class AgeGakunenError(Exception):
    def __str__(self):
        return "同一人物に対し、年齢と学年は両方記載しないか一方のみ記載してください"


# 子育て支援制度・手当
class Process(ProcessBase):
    def __init__(self, period, titles):
        super().__init__(period, titles)

        # 親と子の名前を定義
        self.parents = [ '親1', '親2' ]
        self.children = [ '第1子', '第2子', '第3子', '第4子', '第5子']

    def age2birthday(self, age):
        pr = self.period.split('-')
        pr[0] = int(pr[0]) - int(age)
        pr[1] = int(pr[1]) - 1
        if pr[1] < 1:
            pr[0] -= 1
            pr[1] = 12
        bd = list()
        bd.append(f'{int(pr[0]):04}')
        bd.append(f'{int(pr[1]):02}')
        bd.append(f'{int(pr[2]):02}')
        return '-'.join(bd)
    
    def gakunen2birthday(self, gakunen):
        if gakunen == '小学生未満':
            gakunen_num = 0
        elif gakunen == '小1':
            gakunen_num = 1
        elif gakunen == '小2':
            gakunen_num = 2
        elif gakunen == '小3':
            gakunen_num = 3
        elif gakunen == '小4':
            gakunen_num = 4
        elif gakunen == '小5':
            gakunen_num = 5
        elif gakunen == '小6':
            gakunen_num = 6
        elif gakunen == '中1':
            gakunen_num = 7
        elif gakunen == '中2':
            gakunen_num = 8
        elif gakunen == '中3':
            gakunen_num = 9
        elif gakunen == '高1':
            gakunen_num = 10
        elif gakunen == '高2':
            gakunen_num = 11
        elif gakunen == '高3':
            gakunen_num = 12
        elif gakunen == '高校生より大きい':
            gakunen_num = 13

        pr = self.period.split('-')
        pr[0] = int(pr[0]) - gakunen_num - 6
        pr[1] = int(pr[1]) - 1
        if pr[1] < 1:
            pr[0] -= 1
            pr[1] = 12
        bd = list()
        bd.append(f'{int(pr[0]):04}')
        bd.append(f'{int(pr[1]):02}')
        bd.append(f'{int(pr[2]):02}')
        return '-'.join(bd)

    def process(self, row):
        res = super().process(row)
        d_input = dict()
        d_input['世帯'] = dict()
        d_input['世帯']['保護者一覧'] = []
        d_input['世帯']['児童一覧'] = []
        d_input['世帯員'] = dict()
        d_output = {'世帯': {}}
        allowance = row[self.titles['対象支援制度']]
        people = []

        ### 入力情報を追加 ###
        # 世帯の一覧属性
        for p in self.parents:
            if row[self.titles[f'{p}_年齢']] or row[self.titles[f'{p}_学年']]:
                d_input['世帯']['保護者一覧'].append(p)
                people.append(p)
                
        for p in self.children:
            if row[self.titles[f'{p}_年齢']] or row[self.titles[f'{p}_学年']]:
                d_input['世帯']['児童一覧'].append(p)
                people.append(p)

        if row[self.titles["配偶者がいるがひとり親に該当"]] == 'する':
            d_input['世帯']["配偶者がいるがひとり親に該当"] = {self.period: True}

        # 世帯員の属性
        for p in people:
            d_input['世帯員'][p] = {}
            p_dict = d_input['世帯員'][p]

            # 年齢と学年が両方記載されている時に例外を発生させる（年齢と学年が食い違っている可能性があるため）
            if row[self.titles[f'{p}_年齢']] and row[self.titles[f'{p}_学年']]:
                raise AgeGakunenError

            if row[self.titles[f'{p}_年齢']]:
                p_dict['誕生年月日'] = self.age2birthday(row[self.titles[f'{p}_年齢']])
            elif row[self.titles[f'{p}_学年']]:
                p_dict['誕生年月日'] = self.gakunen2birthday(row[self.titles[f'{p}_学年']])

            if row[self.titles[f'{p}_身体障害者手帳等級']]:
                disability = row[self.titles[f'{p}_身体障害者手帳等級']]
                if disability == '0':
                    p_dict['身体障害者手帳等級認定'] = '無'
                elif disability == '1':
                    p_dict['身体障害者手帳等級認定'] = '一級'
                elif disability == '2':
                    p_dict['身体障害者手帳等級認定'] = '二級'
                elif disability == '3':
                    p_dict['身体障害者手帳等級認定'] = '三級'
                elif disability == '4':
                    p_dict['身体障害者手帳等級認定'] = '四級'
                elif disability == '5':
                    p_dict['身体障害者手帳等級認定'] = '五級'
                elif disability == '6':
                    p_dict['身体障害者手帳等級認定'] = '六級'
                elif disability == '7':
                    p_dict['身体障害者手帳等級認定'] = '七級'

                p_dict['身体障害者手帳交付年月日'] = self.period

            if row[self.titles[f'{p}_療育手帳等級']]:
                disability = row[self.titles[f'{p}_療育手帳等級']]
                if disability == '0':
                    p_dict['療育手帳等級'] = '無'
                elif disability == 'A':
                    p_dict['療育手帳等級'] = 'A'
                elif disability == 'B':
                    p_dict['療育手帳等級'] = 'B'
                
            if row[self.titles[f'{p}_愛の手帳等級']]:
                disability = row[self.titles[f'{p}_愛の手帳等級']]
                if disability == '0':
                    p_dict['愛の手帳等級'] = '無'
                elif disability == '1':
                    p_dict['愛の手帳等級'] = '一度'
                elif disability == '2':
                    p_dict['愛の手帳等級'] = '二度'
                elif disability == '3':
                    p_dict['愛の手帳等級'] = '三度'
                elif disability == '4':
                    p_dict['愛の手帳等級'] = '四度'

            if row[self.titles[f'{p}_精神障害者保健福祉手帳等級']]:
                disability = row[self.titles[f'{p}_精神障害者保健福祉手帳等級']]
                if disability == '0':
                    p_dict['精神障害者保健福祉手帳等級'] = '無'
                elif disability == '1':
                    p_dict['精神障害者保健福祉手帳等級'] = '一級'
                elif disability == '2':
                    p_dict['精神障害者保健福祉手帳等級'] = '二級'
                elif disability == '3':
                    p_dict['精神障害者保健福祉手帳等級'] = '三級'

            if row[self.titles[f'{p}_脳性まひ_進行性筋萎縮症']]:
                p_dict['脳性まひ_進行性筋萎縮症'] = row[self.titles[f'{p}_脳性まひ_進行性筋萎縮症']]

            if row[self.titles[f'{p}_内部障害']]:
                p_dict['内部障害'] = row[self.titles[f'{p}_内部障害']]
                
            if self.titles.get(f'{p}_所得') and row[self.titles[f'{p}_所得']]:
                income = int(row[self.titles[f'{p}_所得']].replace(',', ''))
                p_dict['所得'] = {self.period: income}

        
        ### 出力情報を追加 ###
        # 正解となる支給額を追加
        max_output = int(row[self.titles["支給額（一意に決まる額 or 最大額）"]].replace(',', ''))
        if allowance == '児童扶養手当' or allowance == '特別児童扶養手当':
            d_output['世帯'][f'{allowance}_最大'] = {self.period: max_output}

            if row[self.titles["支給額（最小額 or 一意に決まる場合は空欄）"]]:
                min_output = int(row[self.titles["支給額（最小額 or 一意に決まる場合は空欄）"]].replace(',', ''))
                d_output['世帯'][f'{allowance}_最小'] = {self.period: min_output}
            else:
                d_output['世帯'][f'{allowance}_最小'] = {self.period: max_output}

        else:
            d_output['世帯'][f'{allowance}'] = {self.period: max_output}

        res['input'] = d_input
        res['output'] = d_output
        return res

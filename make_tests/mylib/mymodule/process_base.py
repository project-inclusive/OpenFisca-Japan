# -*- coding: utf-8 -*-

class AgeGakunenError(Exception):
    def __str__(self):
        return "同一人物に対し、年齢と学年は両方記載しないか一方のみ記載してください"
    

class ProcessBase:
    def __init__(self, period, titles):
        self.period = period
        self.titles = titles
        self.dict_titles = dict()
        for title in titles:
            self.dict_titles[title] = title

    def create_adult(self):
        birthday = self.period.split('-')
        if len(birthday) < 2:
            return None, None
        birthday[0] = str(int(birthday[0]) - 20)
        return '-'.join(birthday), 20

    def process(self, row):
        res = dict()
        res['name'] = 'テストID=' + row[self.titles['テストID']]
        res['period'] = self.period
        return res

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

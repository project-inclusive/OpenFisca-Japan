# -*- coding: utf-8 -*-
import csv

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

"""
OpenFiscaのシミュレーションサンプルコード

参考: OpenFisca公式サイトのシミュレーションに関するページ
https://openfisca.org/doc/simulate/run-simulation.html
"""

import os
import time
import locale
import sys

import numpy as np
from openfisca_core.simulation_builder import SimulationBuilder
from openfisca_japan import CountryTaxBenefitSystem


def check_cp932_env():
    """
    Windowsで [UnicodeDecodeError: 'cp932' codec can't decode byte...] が出た時の確認スクリプト

    詳細対処法は以下リンクを参照
    https://qiita.com/misohagi/items/e26c589506a69261fe04
    """
    print(os.environ.get("PYTHONIOENCODING"))
    print(sys.getdefaultencoding())
    print(sys.getfilesystemencoding())
    print(sys.stdout.encoding)
    print(locale.getpreferredencoding())


def simulate_all():
    """
    全制度をシミュレーション実行
    """
    # OpenFisca-Japanで対応している全ての制度
    allowance_list = ["児童手当",
                      "児童扶養手当_最大", "児童扶養手当_最小",
                      "特別児童扶養手当_最大", "特別児童扶養手当_最小",
                      "障害児福祉手当",
                      "福祉費",
                      "生活保護",
                      "高等学校奨学給付金_最大", "高等学校奨学給付金_最小",
                      "高等学校等就学支援金_最大", "高等学校等就学支援金_最小",
                      "児童育成手当",
                      "障害児童育成手当",
                      "重度心身障害者手当_最大", "重度心身障害者手当_最小",
                      "受験生チャレンジ支援貸付",
                      "健康管理費用_最大", "健康管理費用_最小",
                      "健康管理支援事業_最大", "健康管理支援事業_最小",
                      "先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最大",
                      "先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最小",
                      "障害基礎年金_最大", "障害基礎年金_最小",
                      "特別障害者手当_最大", "特別障害者手当_最小",
                      "傷病手当金_最大", "傷病手当金_最小",
                      "災害弔慰金",
                      "災害障害見舞金_最大", "災害障害見舞金_最小",
                      "被災者生活再建支援制度",
                      "災害援護資金"]

    ### データの読み込み ###
    # 人物単位で定義される属性(ex. 誕生年月日)と世帯単位で定義される属性(ex. 居住都道府県)を区別して読み込む
    # 人物ID, 世帯IDとそれぞれ紐づくため

    # 人物データ. Numpyのndarray配列としてOpenFiscaに入力するためPandasを使った方が簡便
    data_persons = np.loadtxt("data_persons.csv", delimiter=",", dtype=str,
                              encoding="utf-8")
    # data_persons_dict = {列名: 列の配列} のフォーマットにする
    data_persons_dict = {}
    for i in range(len(data_persons[0])):
        data_persons_dict[data_persons[0, i]] = data_persons[1:, i]

    # 世帯データ
    data_households = np.loadtxt("data_households.csv", delimiter=",", dtype=str,
                                 encoding="utf-8")
    # data_households_dict = {列名: 列の配列} のフォーマットにする
    data_households_dict = {}
    for i in range(len(data_households[0])):
        data_households_dict[data_households[0, i]] = data_households[1:, i]


    ### OpenFiscaの準備 ###
    tax_benefit_system = CountryTaxBenefitSystem()
    sb = SimulationBuilder()
    sb.create_entities(tax_benefit_system)

    # 人物(世帯員)と世帯のそれぞれ一意なIDの登録
    sb.declare_person_entity("人物", data_persons_dict["person_id"])
    household_instance = sb.declare_entity("世帯", data_households_dict["household_id"])

    # 人物(世帯員)と世帯の紐付け #
    person_household = data_persons_dict["household_id"]
    # 人物(世帯員, entity)のrole. ["親", "子", "祖父母"] のいずれか
    person_household_role = data_persons_dict["person_role_in_household"]
    sb.join_with_persons(household_instance, person_household, person_household_role)

    # 制度計算の対象とする日時. YYYY-MM-DD 形式で記述する. 過去の日時も指定可能
    period = "2025-04-05"


    ### 必須の入力属性 ###
    # (その他の必須ではない属性は未入力の場合デフォルト値が適用されるため、基本的な制度の計算には影響なし.
    # ex. 身体障害者手帳: 無)
    simulation = sb.build(tax_benefit_system)

    # 人物の年齢は誕生年月日とperiodによって算出される.
    # 年齢のみを指定すると子供の学年が定義されないため、誕生年月日の指定が必要
    # YYYY-MM-DD 形式
    simulation.set_input("誕生年月日", period, data_persons_dict["誕生年月日"])
    # 数値の文字列はint型に変換
    simulation.set_input("収入", period, data_persons_dict["収入"].astype(int))
    simulation.set_input("居住都道府県", period, data_households_dict["居住都道府県"])
    simulation.set_input("居住市区町村", period, data_households_dict["居住市区町村"])


    ### シミュレーション実行 ###
    # (中間変数を出力することも可能. ex. 世帯高所得)
    for allowance in allowance_list:
        amount = simulation.calculate(allowance, period)
        print(f"{allowance}: {amount}")


def simulate_生活保護():
    """
    計算ステップの多い生活保護に対し、10万人(1人世帯)のデータを入力して計算時間を計測

    Macbook Proで数秒程度で計算完了
    """

    tax_benefit_system = CountryTaxBenefitSystem()
    sb = SimulationBuilder()
    sb.create_entities(tax_benefit_system)

    person_cnt = 100000
    persons_ids = np.arange(person_cnt)
    sb.declare_person_entity("人物", persons_ids)

    households_ids = np.arange(person_cnt)
    household_instance = sb.declare_entity("世帯", households_ids)

    persons_households = np.arange(person_cnt)
    persons_households_roles = np.array(["親" for _ in range(person_cnt)])
    sb.join_with_persons(household_instance, persons_households, persons_households_roles)

    period = "2025-04-05"

    shunyu_arr = np.ones(person_cnt) * 1000000
    age_arr = np.ones(person_cnt) * 30

    居住都道府県_arr = np.array(["東京都" for _ in range(person_cnt)])
    居住市区町村_arr = np.array(["新宿区" for _ in range(person_cnt)])

    simulation = sb.build(tax_benefit_system)
    simulation.set_input("収入", period, shunyu_arr)
    simulation.set_input("居住都道府県", period, 居住都道府県_arr)
    simulation.set_input("居住市区町村", period, 居住市区町村_arr)
    simulation.set_input("年齢", period, age_arr)

    start = time.time()
    生活保護 = simulation.calculate("生活保護", period)
    finish = time.time()

    print(f"生活保護: {生活保護}, processed time: {finish - start} s")


def main():
    #check_cp932_env()
    simulate_all()
    #simulate_生活保護()  # 大量データの計算時間の計測


if __name__ == "__main__":
    main()

"""
身体障害者手帳の実装
"""

from datetime import date
from datetime import datetime

from dateutil.relativedelta import relativedelta
from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import ETERNITY, MONTH, DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 身体障害者手帳交付年月日(Variable):
    value_type = date
    entity = 人物
    label = "人物の身体障害者手帳の最新交付年月日"
    definition_period = ETERNITY


class 身体障害者手帳等級認定パターン(Enum):
    __order__ = "無 一級 二級 三級 四級 五級 六級 七級"
    無 = "無"
    一級 = "一級"
    二級 = "二級"
    三級 = "三級"
    四級 = "四級"
    五級 = "五級"
    六級 = "六級"
    七級 = "七級"


class 身体障害者手帳等級認定(Variable):
    value_type = Enum
    possible_values = 身体障害者手帳等級認定パターン
    default_value = 身体障害者手帳等級認定パターン.無
    entity = 人物
    definition_period = ETERNITY
    label = "人物の身体障害者手帳の最新等級認定"


class 身体障害者手帳等級(Variable):
    value_type = Enum
    possible_values = 身体障害者手帳等級認定パターン
    default_value = 身体障害者手帳等級認定パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の身体障害者手帳等級"

    def formula(対象人物, 対象期間, _parameters):
        """
        人物の有効な身体障害者手帳の等級

        身体障害者手帳の有効期限は二年間
        """
        最新交付年月日 = 対象人物("身体障害者手帳交付年月日", 対象期間)
        # OpenFiscaにおいては、NumPyのdatetime64とPythonのdatetimeがごちゃまぜになっている
        # だるいのでPythonのdatetimeに揃える
        #   最新交付年月日はNumPyのdatetime64
        #   対象期間はOpenFiscaのPeriodというクラス
        #     対象期間.dateはPythonのdatetimeになる
        交付年月日 = 最新交付年月日.astype("datetime64[D]").astype(datetime)
        # python-dateutilのrelativedeltaを使って日時の足し算をする
        有効年月日 = 交付年月日 + relativedelta(years=2)
        # Pythonのdatetime同士なら比較演算子が普通に使える
        身体障害者手帳が有効 = (交付年月日 <= 対象期間.date) * (対象期間.date <= 有効年月日)
        身体障害者手帳等級認定 = 対象人物("身体障害者手帳等級認定", 対象期間)
        return (身体障害者手帳が有効 * 身体障害者手帳等級認定)

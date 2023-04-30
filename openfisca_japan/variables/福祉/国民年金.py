"""
国民年金の実装
"""

from numpy import asarray
from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import ETERNITY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 国民年金被保険者パターン(Enum):
    __order__ = "無 第1号被保険者 第2号被保険者 第3号被保険者"
    無 = "無"
    第1号被保険者 = "第1号被保険者"
    第2号被保険者 = "第2号被保険者"
    第3号被保険者 = "第3号被保険者"


class 国民年金被保険者(Variable):
    value_type = Enum
    possible_values = 国民年金被保険者パターン
    default_value = 国民年金被保険者パターン.無
    entity = 人物
    definition_period = ETERNITY
    label = "人物の国民年金被保険者"
    reference = "https://www.nenkin.go.jp/service/yougo/kagyo/kokuminkainenkin.html"

    def formula(対象人物, 対象期間, parameters):
        年齢 = 対象人物("年齢", 対象期間)
        開始年齢 = parameters(対象期間).福祉.国民年金.第1号被保険者.開始年齢
        終了年齢 = parameters(対象期間).福祉.国民年金.第1号被保険者.終了年齢
        国民年金被保険者条件 = (開始年齢 <= 年齢) * (年齢 < 終了年齢)
        パターン = 国民年金被保険者パターン.第1号被保険者 if 国民年金被保険者条件 else 国民年金被保険者パターン.無
        return 国民年金被保険者パターン.encode(asarray([パターン]))[0]

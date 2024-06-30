"""
血液凝固因子異常症の実装
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 先天性の血液凝固因子異常症である可能性がある(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "先天性の血液凝固因子異常症である可能性がある"
    documentation = """
    「先天性の血液凝固因子異常症である」の場合と異なり、「その他」の場合も含める
    """

    def formula(対象人物, 対象期間, _parameters):
        血液凝固因子異常症種別 = 対象人物("血液凝固因子異常症種別", 対象期間)
        return 血液凝固因子異常症種別 != 血液凝固因子異常症種別パターン.無


class 先天性の血液凝固因子異常症である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "先天性の血液凝固因子異常症である"

    def formula(対象人物, 対象期間, _parameters):
        血液凝固因子異常症種別 = 対象人物("血液凝固因子異常症種別", 対象期間)
        return (血液凝固因子異常症種別 != 血液凝固因子異常症種別パターン.無) * \
            (血液凝固因子異常症種別 != 血液凝固因子異常症種別パターン.その他)


class 血液凝固因子異常症種別パターン(Enum):
    __order__ = "無 第I因子欠乏症 第II因子欠乏症 第V因子欠乏症 第VII因子欠乏症 第VIII因子欠乏症 第IX因子欠乏症 第X因子欠乏症 第XI因子欠乏症 第XII因子欠乏症 第XIII因子欠乏症 フォンヴィルブランド病 その他"
    無 = "無"
    # フィブリノゲン欠乏症
    第I因子欠乏症 = "第I因子欠乏症"
    # プロトロビン欠乏症
    第II因子欠乏症 = "第II因子欠乏症"
    # 不安定因子欠乏症
    第V因子欠乏症 = "第V因子欠乏症"
    # 安定因子欠乏症
    第VII因子欠乏症 = "第VII因子欠乏症"
    # 血友病A
    第VIII因子欠乏症 = "第VIII因子欠乏症"
    # 血友病B
    第IX因子欠乏症 = "第IX因子欠乏症"
    # スチュアートプラウア欠乏症
    第X因子欠乏症 = "第X因子欠乏症"
    # PTA欠乏症
    第XI因子欠乏症 = "第XI因子欠乏症"
    # ヘイグマン因子欠乏症
    第XII因子欠乏症 = "第XII因子欠乏症"
    # フィブリン安定化因子欠乏症
    第XIII因子欠乏症 = "第XIII因子欠乏症"
    # フォン・ヴィルブランド病
    フォンヴィルブランド病 = "フォンヴィルブランド病"
    # 選択肢にない場合、または分からない場合に選ばれる
    その他 = "その他"


class 血液凝固因子異常症種別(Variable):
    value_type = Enum
    possible_values = 血液凝固因子異常症種別パターン
    default_value = 血液凝固因子異常症種別パターン.無
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症種別"


class 血友病の可能性がある(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "血友病の可能性がある"
    documentation = """
    血友病である場合に加え、分からない場合も含まれる
    """

    def formula(対象人物, 対象期間, _parameters):
        血液凝固因子異常症種別 = 対象人物("血液凝固因子異常症種別", 対象期間)
        return (血液凝固因子異常症種別 == 血液凝固因子異常症種別パターン.第VIII因子欠乏症) + \
            (血液凝固因子異常症種別 == 血液凝固因子異常症種別パターン.第IX因子欠乏症) +\
            (血液凝固因子異常症種別 == 血液凝固因子異常症種別パターン.その他)  # 分からない場合も選ばれる


class 血友病である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "血友病である"

    def formula(対象人物, 対象期間, _parameters):
        血液凝固因子異常症種別 = 対象人物("血液凝固因子異常症種別", 対象期間)
        return (血液凝固因子異常症種別 == 血液凝固因子異常症種別パターン.第VIII因子欠乏症) + \
            (血液凝固因子異常症種別 == 血液凝固因子異常症種別パターン.第IX因子欠乏症)

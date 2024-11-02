"""
血液凝固因子異常症の実装
"""

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
        先天性の血液凝固因子異常症である = 対象人物("先天性の血液凝固因子異常症である", 対象期間)
        その他 = 対象人物("血液凝固因子異常症_その他", 対象期間)
        return 先天性の血液凝固因子異常症である + その他


class 先天性の血液凝固因子異常症である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "先天性の血液凝固因子異常症である"

    def formula(対象人物, 対象期間, _parameters):
        第I因子欠乏症 = 対象人物("血液凝固因子異常症_第I因子欠乏症", 対象期間)
        第II因子欠乏症 = 対象人物("血液凝固因子異常症_第II因子欠乏症", 対象期間)
        第V因子欠乏症 = 対象人物("血液凝固因子異常症_第V因子欠乏症", 対象期間)
        第VII因子欠乏症 = 対象人物("血液凝固因子異常症_第VII因子欠乏症", 対象期間)
        第VIII因子欠乏症 = 対象人物("血液凝固因子異常症_第VIII因子欠乏症", 対象期間)
        第IX因子欠乏症 = 対象人物("血液凝固因子異常症_第IX因子欠乏症", 対象期間)
        第X因子欠乏症 = 対象人物("血液凝固因子異常症_第X因子欠乏症", 対象期間)
        第XI因子欠乏症 = 対象人物("血液凝固因子異常症_第XI因子欠乏症", 対象期間)
        第XII因子欠乏症 = 対象人物("血液凝固因子異常症_第XII因子欠乏症", 対象期間)
        第XIII因子欠乏症 = 対象人物("血液凝固因子異常症_第XIII因子欠乏症", 対象期間)
        フォンヴィルブランド病 = 対象人物("血液凝固因子異常症_フォンヴィルブランド病", 対象期間)

        return 第I因子欠乏症 + 第II因子欠乏症 + 第V因子欠乏症 + 第VII因子欠乏症 + 第VIII因子欠乏症 +\
            第IX因子欠乏症 + 第X因子欠乏症 + 第XI因子欠乏症 + 第XII因子欠乏症 + 第XIII因子欠乏症 + フォンヴィルブランド病


# NOTE: OpenFiscaでは現状世帯員がEnumの配列を持つことができないため、因子ごとにbool値で表現している
# TODO: 世帯員がEnumを複数保持できるようになったらEnumに書き直す


class 血液凝固因子異常症_第I因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第I因子欠乏症）"
    documentation = """
    フィブリノゲン欠乏症
    """


class 血液凝固因子異常症_第II因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第II因子欠乏症）"
    documentation = """
    プロトロビン欠乏症
    """


class 血液凝固因子異常症_第V因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第V因子欠乏症）"
    documentation = """
    不安定因子欠乏症
    """


class 血液凝固因子異常症_第VII因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（VII因子欠乏症）"
    documentation = """
    安定因子欠乏症
    """


class 血液凝固因子異常症_第VIII因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第VIII因子欠乏症）"
    documentation = """
    血友病A
    """


class 血液凝固因子異常症_第IX因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第IX因子欠乏症）"
    documentation = """
    血友病B
    """


class 血液凝固因子異常症_第X因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第X因子欠乏症）"
    documentation = """
    スチュアートプラウア欠乏症
    """


class 血液凝固因子異常症_第XI因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第XI因子欠乏症）"
    documentation = """
    PTA欠乏症
    """


class 血液凝固因子異常症_第XII因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第XII因子欠乏症）"
    documentation = """
    ヘイグマン因子欠乏症
    """


class 血液凝固因子異常症_第XIII因子欠乏症(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（第XIII因子欠乏症）"
    documentation = """
    フィブリン安定化因子欠乏症
    """


class 血液凝固因子異常症_フォンヴィルブランド病(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（フォン・ヴィルブランド病）"


class 血液凝固因子異常症_その他(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子異常症（その他）"
    documentation = """
    上記いずれの因子にも該当しない、どれに該当するか分からない、または因子異常症であるかどうか分からない場合に選ばれる
    """


class 血友病の可能性がある(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "血友病の可能性がある"
    documentation = """
    血友病である場合に加え、分からない場合も含まれる
    """

    def formula(対象人物, 対象期間, _parameters):
        第VIII因子欠乏症 = 対象人物("血液凝固因子異常症_第VIII因子欠乏症", 対象期間)
        第IX因子欠乏症 = 対象人物("血液凝固因子異常症_第IX因子欠乏症", 対象期間)
        その他 = 対象人物("血液凝固因子異常症_その他", 対象期間)
        return 第VIII因子欠乏症 + 第IX因子欠乏症 + その他  # 分からない場合も選ばれる


class 血友病である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "血友病である"

    def formula(対象人物, 対象期間, _parameters):
        第VIII因子欠乏症 = 対象人物("血液凝固因子異常症_第VIII因子欠乏症", 対象期間)
        第IX因子欠乏症 = 対象人物("血液凝固因子異常症_第IX因子欠乏症", 対象期間)
        return 第VIII因子欠乏症 + 第IX因子欠乏症

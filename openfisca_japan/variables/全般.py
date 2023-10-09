from openfisca_core.indexed_enums import Enum

class 中学生学年(Enum):
    __order__ = "一年生 二年生 三年生"
    一年生 = 7
    二年生 = 8
    三年生 = 9

class 高校生学年(Enum):
    __order__ = "一年生 二年生 三年生"
    一年生 = 10
    二年生 = 11
    三年生 = 12

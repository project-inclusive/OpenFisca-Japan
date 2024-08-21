"""
This file defines the entities needed by our legislation.

税金 and benefits can be calculated for different entities: 世帯, 人物, companies, etc.

See https://openfisca.org/doc/key-concepts/人物,_entities,_role.html
"""

from openfisca_core.entities import build_entity

世帯 = build_entity(
    key = "世帯",
    plural = "世帯一覧",
    label = "All the people in a family or group who live together in the same place.",
    doc = """
    世帯 is an example of a group entity.
    A group entity contains one or more individual·s.
    Each individual in a group entity has a role (e.g. parent or children). Some roles can only be held by a limited number of individuals (e.g. a "first_parent" can only be held by one individual), while others can have an unlimited number of individuals (e.g. "children").

    Example:
    Housing variables (e.g. 固定資産税") are usually defined for a group entity such as "世帯".

    Usage:
    Check the number of individuals of a specific role (e.g. check if there is a "second_parent" with 世帯.nb_人物(世帯.SECOND_PARENT)).
    Calculate a variable applied to each individual of the group entity (e.g. calculate the "所得" of each member of the "世帯" with salaries = 世帯.members("所得", period = MONTH); sum_salaries = 世帯.sum(salaries)).

    For more information, see: https://openfisca.org/doc/coding-the-legislation/50_entities.html
    """,
    roles = [
        {
            "key": "親",  # 子供がいない場合も大人は「親」entityとする
            "plural": "親一覧",
            "label": "親",
            "max": 2,
            "doc": "大人あるいは子を持つ親",
            },
        {
            "key": "子",
            "plural": "子一覧",
            "label": "子",
            "doc": "親と同居している子供",
            },
        {
            "key": "祖父母",
            "plural": "祖父母一覧",
            "label": "祖父母",
            "doc": "Other individuals living in the 世帯.",
            },
        ],
    )

人物 = build_entity(
    key = "人物",
    plural = "世帯員",
    label = "An individual. The minimal legal entity on which a legislation might be applied.",
    doc = """

    Variables like "所得" and "所得税" are usually defined for the entity "人物".

    Usage:
    Calculate a variable applied to a "人物" (e.g. access the "所得" of a specific month with 人物("所得", "2017-05")).
    Check the role of a "人物" in a group entity (e.g. check if a the "人物" is a "first_parent" in a "世帯" entity with 人物.has_role(世帯.FIRST_PARENT)).

    For more information, see: https://openfisca.org/doc/coding-the-legislation/50_entities.html
    """,
    is_person = True,
    )

entities = [世帯, 人物]

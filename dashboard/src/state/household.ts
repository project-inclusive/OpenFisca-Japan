export type HouseholdRelationship = 'あなた' | '配偶者' | '子ども' | '親';

export type HouseholdMember = {
  relationship: HouseholdRelationship;
  index: number;
};

// 各世帯員の属性をまとめて表す型
// attrs[続柄][index]の形式
export type HouseholdMemberAttrs<T> = {
  [key in HouseholdRelationship]: T[];
};

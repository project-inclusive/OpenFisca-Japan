import { HouseholdRelationship } from './household';
import { QuestionStateContext } from './questionState';

type OpenFiscaField<T> = {
  [K in string]: T;
};

export type OpenFiscaHousehold = {
  世帯員: {
    あなた: {
      誕生年月日: OpenFiscaField<string>;
      収入: OpenFiscaField<number>;
    };
  };
  世帯一覧: {
    世帯1: {
      親一覧: HouseholdRelationship[];
      居住都道府県: OpenFiscaField<string>;
      居住市区町村: OpenFiscaField<string>;

      // バックエンド側で計算されるVariable
      児童手当: OpenFiscaField<any>;
      児童扶養手当_最大: OpenFiscaField<any>;
      児童扶養手当_最小: OpenFiscaField<any>;
      特別児童扶養手当_最小: OpenFiscaField<any>;
      特別児童扶養手当_最大: OpenFiscaField<any>;
      生活保護: OpenFiscaField<any>;
      障害児福祉手当: OpenFiscaField<any>;
      高等学校奨学給付金_最小: OpenFiscaField<any>;
      高等学校奨学給付金_最大: OpenFiscaField<any>;
      生活支援費: OpenFiscaField<any>;
      一時生活再建費: OpenFiscaField<any>;
      福祉費: OpenFiscaField<any>;
      緊急小口資金: OpenFiscaField<any>;
      教育支援費: OpenFiscaField<any>;
      就学支度費: OpenFiscaField<any>;
      不動産担保型生活資金: OpenFiscaField<any>;
      災害弔慰金: OpenFiscaField<any>;
      災害障害見舞金_最大: OpenFiscaField<any>;
      災害障害見舞金_最小: OpenFiscaField<any>;
      被災者生活再建支援制度: OpenFiscaField<any>;
      災害援護資金: OpenFiscaField<any>;
      高等学校等就学支援金_最大: OpenFiscaField<any>;
      高等学校等就学支援金_最小: OpenFiscaField<any>;
      健康管理費用_最大: OpenFiscaField<any>;
      健康管理費用_最小: OpenFiscaField<any>;
      健康管理支援事業_最大: OpenFiscaField<any>;
      健康管理支援事業_最小: OpenFiscaField<any>;
      先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最大: OpenFiscaField<any>;
      先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最小: OpenFiscaField<any>;
      障害基礎年金_最大: OpenFiscaField<any>;
      障害基礎年金_最小: OpenFiscaField<any>;
      特別障害者手当_最大: OpenFiscaField<any>;
      特別障害者手当_最小: OpenFiscaField<any>;
      特定疾病療養の対象者がいる: OpenFiscaField<any>;
      先天性血液凝固因子障害等治療研究事業の対象者がいる: OpenFiscaField<any>;
      重度心身障害者医療費助成制度の対象者がいる: OpenFiscaField<any>;
      傷病手当金_最大: OpenFiscaField<any>;
      傷病手当金_最小: OpenFiscaField<any>;
      児童育成手当?: OpenFiscaField<any>;
      障害児童育成手当?: OpenFiscaField<any>;
      重度心身障害者手当_最小?: OpenFiscaField<any>;
      重度心身障害者手当_最大?: OpenFiscaField<any>;
      受験生チャレンジ支援貸付?: OpenFiscaField<any>;
      住宅入居費?: OpenFiscaField<any>;
    };
  };
};

export const toOpenFiscaHousehold = ({
  context,
  currentDate,
}: {
  context: QuestionStateContext;
  currentDate: string;
}): OpenFiscaHousehold => {
  const household: OpenFiscaHousehold = {
    // Household members
    世帯員: {
      // You
      あなた: {
        // TODO: contextから取得
        誕生年月日: {
          ETERNITY: `2000-01-01`,
        },
        収入: {
          [currentDate]: 1000000,
        },
      },
    },
    // Household
    世帯一覧: {
      // Household 1
      世帯1: {
        // Self List: ['You']
        親一覧: ['あなた'],
        居住都道府県: {
          [currentDate]: context.住んでいる場所.あなた[0].prefecure,
        },
        居住市区町村: {
          [currentDate]: context.住んでいる場所.あなた[0].municipality,
        },

        // 以下はOpenFisca側から受け取りたいVariableを指定
        // 値は計算前のためすべてnullで指定
        // Child Allowance
        児童手当: {
          [currentDate]: null,
        },
        // Maximum Child Support Allowance
        児童扶養手当_最大: {
          [currentDate]: null,
        },
        // Minimum Child Support Allowance
        児童扶養手当_最小: {
          [currentDate]: null,
        },
        // Minimum Special Child Support Allowance
        特別児童扶養手当_最小: {
          [currentDate]: null,
        },
        // Maximum Special Child Support Allowance
        特別児童扶養手当_最大: {
          [currentDate]: null,
        },
        // Livelihood Protection
        生活保護: {
          [currentDate]: null,
        },
        // Handicapped Children Welfare Allowance
        障害児福祉手当: {
          [currentDate]: null,
        },
        // Minimum High School Scholarship
        高等学校奨学給付金_最小: {
          [currentDate]: null,
        },
        // Maximum High School Scholarship
        高等学校奨学給付金_最大: {
          [currentDate]: null,
        },
        // Livelihood Support Payment
        生活支援費: {
          [currentDate]: null,
        },
        // Temporary Life Reconstruction Payment
        一時生活再建費: {
          [currentDate]: null,
        },
        // Welfare Expenses
        福祉費: {
          [currentDate]: null,
        },
        // Emergency Small Amount Fund
        緊急小口資金: {
          [currentDate]: null,
        },
        // Education Support Payment
        教育支援費: {
          [currentDate]: null,
        },
        // School Enrollment Expenses
        就学支度費: {
          [currentDate]: null,
        },
        // Real Estate Secured Living Expenses
        不動産担保型生活資金: {
          [currentDate]: null,
        },
        // Disaster condolence money
        災害弔慰金: {
          [currentDate]: null,
        },
        // Disaster disability compensation money MAX
        災害障害見舞金_最大: {
          [currentDate]: null,
        },
        // Disaster disability compensation money MIN
        災害障害見舞金_最小: {
          [currentDate]: null,
        },
        // Disaster victim life reconstruction support system
        被災者生活再建支援制度: {
          [currentDate]: null,
        },
        // Disaster relief funds
        災害援護資金: {
          [currentDate]: null,
        },
        高等学校等就学支援金_最大: {
          [currentDate]: null,
        },
        高等学校等就学支援金_最小: {
          [currentDate]: null,
        },
        健康管理費用_最大: {
          [currentDate]: null,
        },
        健康管理費用_最小: {
          [currentDate]: null,
        },
        健康管理支援事業_最大: {
          [currentDate]: null,
        },
        健康管理支援事業_最小: {
          [currentDate]: null,
        },
        先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最大:
          {
            [currentDate]: null,
          },
        先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最小:
          {
            [currentDate]: null,
          },
        障害基礎年金_最大: {
          [currentDate]: null,
        },
        障害基礎年金_最小: {
          [currentDate]: null,
        },
        特別障害者手当_最大: {
          [currentDate]: null,
        },
        特別障害者手当_最小: {
          [currentDate]: null,
        },
        特定疾病療養の対象者がいる: {
          [currentDate]: null,
        },
        先天性血液凝固因子障害等治療研究事業の対象者がいる: {
          [currentDate]: null,
        },
        重度心身障害者医療費助成制度の対象者がいる: {
          [currentDate]: null,
        },
        傷病手当金_最大: {
          [currentDate]: null,
        },
        傷病手当金_最小: {
          [currentDate]: null,
        },
      },
    },
  };

  // 東京都独自の支援制度
  if (context.住んでいる場所.あなた[0].prefecure === '東京都') {
    household.世帯一覧.世帯1.児童育成手当 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.障害児童育成手当 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.重度心身障害者手当_最小 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.重度心身障害者手当_最大 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.受験生チャレンジ支援貸付 = {
      [currentDate]: null,
    };
  }

  // 「家を借りたい」の回答
  if (context.家を借りたい.あなた[0].selection != null) {
    household.世帯一覧.世帯1.住宅入居費 = {
      [currentDate]: context.家を借りたい.あなた[0].selection,
    };
  }

  // TODO: 仕事に関する設定

  // TODO: contextに対応する値を設定する
  // TODO: contextの世帯員に応じて世帯員を生成する

  return household;
};

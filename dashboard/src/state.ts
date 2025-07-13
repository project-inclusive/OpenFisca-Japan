import { atom } from 'recoil';

const currentDate = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
  .toString()
  .padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;

export const currentDateAtom = atom<string>({
  key: 'currentDateAtom',
  default: currentDate,
});

export const agreedToTermsAtom = atom<boolean>({
  key: 'agreedToTermsAtom',
  default: false,
});

export const questionValidatedAtom = atom<boolean>({
  key: 'questionValidatedAtom',
  default: false,
});

export const showsValidationErrorAtom = atom<boolean>({
  key: 'showsValidationErrorAtom',
  default: false,
});

export type QuestionKey = {
  person: 'あなた' | '配偶者' | '子ども' | '親';
  personNum: number;
  title: string;
};

export const questionKeyAtom = atom<QuestionKey>({
  key: 'questionKeyAtom',
  default: {
    person: 'あなた',
    personNum: 0,
    title: '住んでいる場所',
  },
});

export const nextQuestionKeyAtom = atom<QuestionKey | null>({
  key: 'nextQuestionKeyAtom',
  default: null,
});

export const questionKeyHistoryAtom = atom<QuestionKey[]>({
  key: 'questionKeyHistoryAtom',
  default: [],
});

export const householdAtom = atom<any>({
  key: 'householdAtom',
  default: {
    // Household members
    世帯員: {
      // You
      あなた: {},
    },
    // Household
    世帯一覧: {
      // Household 1
      世帯1: {
        // Self List: ['You']
        親一覧: ['あなた'],
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
        // Exclude Housing Entry Fees until checkbox is enabled
        // Housing Entry Fees
        // 住宅入居費: {
        //   [currentDate]: null,
        // },
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
        // Exam Student Challenge Support Loan
        受験生チャレンジ支援貸付: {
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
        居住都道府県: {
          [currentDate]: '',
        },
        居住市区町村: {
          [currentDate]: '',
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
  },
  dangerouslyAllowMutability: true,
});

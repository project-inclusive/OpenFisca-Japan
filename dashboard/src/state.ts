import { atom, SetterOrUpdater } from 'recoil';
import { QuestionKey } from './question';

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

export const defaultNextQuestionKeyAtom = atom<QuestionKey | null>({
  key: 'defaultNextQuestionKeyAtom',
  default: null,
});

export const questionKeyHistoryAtom = atom<QuestionKey[]>({
  key: 'questionKeyHistoryAtom',
  default: [],
});

export const resetQuestionKeys = ({
  setQuestionKey,
  setNextQuestionKey,
  setDefaultNextQuestionKey,
  setQuestionKeyHistory,
}: {
  setQuestionKey: SetterOrUpdater<QuestionKey>;
  setNextQuestionKey: SetterOrUpdater<QuestionKey | null>;
  setDefaultNextQuestionKey: SetterOrUpdater<QuestionKey | null>;
  setQuestionKeyHistory: SetterOrUpdater<QuestionKey[]>;
}) => {
  setQuestionKey({
    person: 'あなた',
    personNum: 0,
    title: '住んでいる場所',
  });
  setNextQuestionKey(null);
  setDefaultNextQuestionKey(null);
  setQuestionKeyHistory([]);
};

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

export type FrontendHousehold = {
  世帯員: { [key: string]: { [key: string]: any } };
  世帯: { [key: string]: boolean | number | string };
  困りごと: { [key: string]: boolean };
  制度: { [key: string]: boolean };
};

// フロントエンドのみで計算が完結する世帯情報
// NOTE: OpenFiscaでは処理できないためhouseholdとはマージ不可
export const frontendHouseholdAtom = atom<FrontendHousehold>({
  key: 'frontendHouseholdAtom',
  default: {
    世帯員: {
      あなた: {},
    },
    世帯: {},
    困りごと: {
      仕事について: false,
      妊娠について: false,
      出産や子育てについて: false,
      進学について: false,
      介護について: false,
      入院について: false,
      病気や障害について: false,
      離婚について: false,
    },
    制度: {
      '雇用保険（失業手当）': false,
      '求職者支援制度（職業訓練・ハロートレーニング）': false,
      '住宅支援（住居確保給付金）': false,
      '健康保険・年金の減免制度（国民健康保険に加入している場合）': false,
      '健康保険・年金の減免制度（国民年金に加入している場合）': false,
      '健康保険・年金の減免制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）':
        false,
      自立相談支援機関による相談支援: false,
      妊婦健診の助成: false,
      '富士見市出産・子育て応援給付金': false,
      '産前産後休業（産休）': false,
      低所得世帯向けの入院助産制度: false,
      '健康保険・年金の減免制度': false,
      '出産育児一時金（国民健康保険に加入している場合）': false,
      '出産育児一時金（共済組合、協会けんぽまたは健康保険組合に加入している場合）':
        false,
      '出産手当金（会社員・公務員向け）': false,
      育児休業給付金: false,
      '高額療養費制度（国民健康保険に加入している場合）': false,
      '高額療養費制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）':
        false,
      富士見市産後ケア事業: false,
      富士見市こども医療費助成: false,
      ひとり親家庭等医療費助成: false,
      未熟児養育医療費助成: false,
      小児慢性特定疾患医療費助成: false,
      '医療費控除（確定申告）': false,
      養育費に関する公正証書等の作成費用補助: false,
      子どものための養育費相談: false,
      '身体障害者手帳・療育手帳・精神障害者保健福祉手帳': false,
      自立支援医療: false,
      重度障害者医療費助成: false,
      指定難病医療給付制度: false,
      障がい者向けの就労支援: false,
      介護保険制度: false,
      介護休業制度: false,
      介護保険料の減免: false,
      老人介護手当: false,
      介護保険サービス利用者負担助成金: false,
      給付型奨学金: false,
      埼玉県母子寡婦福祉資金貸付金: false,
      埼玉県私立学校の父母負担軽減: false,
    },
  },
  dangerouslyAllowMutability: true,
});

export const householdHistoryAtom = atom<any[]>({
  key: 'householdHistoryAtom',
  default: [],
  dangerouslyAllowMutability: true,
});

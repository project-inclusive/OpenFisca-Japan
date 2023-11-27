import { atom } from 'recoil';

const currentDate = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
  .toString()
  .padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;

export const currentDateAtom = atom<string>({
  key: 'currentDateAtom',
  default: currentDate,
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
    世帯: {
      // Household 1
      世帯1: {
        // Self List: ['You']
        自分一覧: ['あなた'],
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
      },
    },
  },
  dangerouslyAllowMutability: true,
});

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
    世帯員: {
      あなた: {},
    },
    世帯: {
      世帯1: {
        自分一覧: ['あなた'],
        児童手当: {
          [currentDate]: null,
        },
        児童扶養手当_最大: {
          [currentDate]: null,
        },
        児童扶養手当_最小: {
          [currentDate]: null,
        },
        特別児童扶養手当_最小: {
          [currentDate]: null,
        },
        特別児童扶養手当_最大: {
          [currentDate]: null,
        },
        生活保護: {
          [currentDate]: null,
        },
        障害児福祉手当: {
          [currentDate]: null,
        },
        高等学校奨学給付金_最小: {
          [currentDate]: null,
        },
        高等学校奨学給付金_最大: {
          [currentDate]: null,
        },
        生活支援費: {
          [currentDate]: null,
        },
        一時生活再建費: {
          [currentDate]: null,
        },
        福祉費: {
          [currentDate]: null,
        },
        緊急小口資金: {
          [currentDate]: null,
        },
        /* 住宅入居費はチェックボックスを有効化するまで除外
        住宅入居費: {
          [currentDate]: null,
        },
        */
        教育支援費: {
          [currentDate]: null,
        },
        就学支度費: {
          [currentDate]: null,
        },
        不動産担保型生活資金: {
          [currentDate]: null,
        },
        受験生チャレンジ支援貸付: {
          [currentDate]: null,
        },
      },
    },
  },
  dangerouslyAllowMutability: true,
});

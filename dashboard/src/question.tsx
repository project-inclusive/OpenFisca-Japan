export type QuestionKey = {
  person: 'あなた' | '配偶者' | '子ども' | '親';
  personNum: number;
  title: string;
};

// NOTE: クラスのインスタンスはrecoilに設定できないため、メソッドではなく関数を使用
// https://stackoverflow.com/questions/63892846/storing-class-instances-in-recoil
export const personNameFrom = (key: QuestionKey) => {
  switch (key.person) {
    case 'あなた':
      return key.person;
    case '配偶者':
      return key.person;
    case '子ども':
      return `${key.person}${key.personNum}`;
    case '親':
      return `${key.person}${key.personNum}`;
  }
};

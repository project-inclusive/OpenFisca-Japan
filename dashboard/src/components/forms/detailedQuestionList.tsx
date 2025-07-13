import { AddressQuestion } from './questions/addressQuestion';
import { SpouseAgeQuestion } from './questions/spouseAgeQuestion';
import { ChildAgeQuestion } from './questions/childAgeQuestion';
import { ParentAgeQuestion } from './questions/parentAgeQuestion';
import { SpouseExistsQuestion } from './questions/spouseExistsQuestion';
import { SelfIncomeQuestion } from './questions/selfIncomeQuestion';
import { ChildrenNumQuestion } from './questions/childrenNumQuestion';
import { ParentNumQuestion } from './questions/parentNumQuestion';
import { SelfWorkQuestion } from './questions/SelfWorkQuestion';
import { SelfOccupationQuestion } from './questions/selfOccupationQuestion';
import { QuestionList } from './questionList';
import { SelfAgeQuestion } from './questions/selfAgeQuestion';

// NOTE: プログレスバーの計算のために設問に順序関係を定義する必要があるため、objectではなくarrayを使用
// HACK: componentをarray内に定義する際にkeyが必要なため定義している
const questions = {
  あなた: [
    {
      title: '住んでいる場所',
      component: <AddressQuestion key={0} />,
    },
    {
      title: '年齢',
      component: <SelfAgeQuestion key={1} />,
    },
    {
      title: '年収',
      component: <SelfIncomeQuestion key={2} />,
    },
    {
      title: '仕事の有無',
      component: <SelfWorkQuestion key={3} />,
    },
    {
      title: '仕事の種類',
      component: <SelfOccupationQuestion key={4} />,
    },
    {
      title: '配偶者の有無',
      component: <SpouseExistsQuestion key={5} />,
    },
    {
      title: '子どもの人数',
      component: <ChildrenNumQuestion key={6} />,
    },
    {
      title: '親の人数',
      component: <ParentNumQuestion key={7} />,
    },
  ],
  配偶者: [
    {
      title: '年齢',
      component: <SpouseAgeQuestion key={0} />,
    },
  ],
  子ども: [
    {
      title: '年齢',
      component: <ChildAgeQuestion key={0} />,
    },
  ],
  親: [
    {
      title: '年齢',
      component: <ParentAgeQuestion key={0} />,
    },
  ],
};

export const DetailedQuestionList = () => {
  return (
    <QuestionList
      questions={questions}
      isSimpleCalculation={false}
      isDisasterCalculation={false}
    />
  );
};

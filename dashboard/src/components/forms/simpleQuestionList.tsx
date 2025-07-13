import { AddressQuestion } from './questions/addressQuestion';
import { SelfIncomeQuestion } from './questions/selfIncomeQuestion';
import { QuestionList } from './questionList';
import { SpouseIncomeQuestion } from './questions/spouseIncomeQuestion';
import { SimpleChildrenNumQuestion } from './questions/simpleChildrenNumQuestion';
import { ChildAgeQuestion } from './questions/childAgeQuestion';
import { SimpleSpouseExistsQuestion } from './questions/simpleSpouseExistsQuestion';

// NOTE: プログレスバーの計算のために設問に順序関係を定義する必要があるため、objectではなくarrayを使用
// HACK: componentをarray内に定義する際にkeyが必要なため定義している
const questions = {
  あなた: [
    {
      title: '住んでいる場所',
      component: <AddressQuestion key={0} />,
    },
    {
      title: '年収',
      component: <SelfIncomeQuestion key={1} />,
    },
    {
      title: '配偶者の有無',
      component: <SimpleSpouseExistsQuestion key={2} />,
    },
    {
      title: '子どもの人数',
      component: <SimpleChildrenNumQuestion key={3} />,
    },
  ],
  配偶者: [
    {
      title: '年収',
      component: <SpouseIncomeQuestion key={0} />,
    },
  ],
  子ども: [
    {
      title: '年齢',
      component: <ChildAgeQuestion key={0} />,
    },
  ],
  親: [],
};

export const SimpleQuestionList = () => {
  return (
    <QuestionList
      questions={questions}
      isSimpleCalculation={true}
      isDisasterCalculation={false}
    />
  );
};

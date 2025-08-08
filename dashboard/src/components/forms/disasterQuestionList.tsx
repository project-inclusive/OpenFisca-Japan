import { AddressQuestion } from './questions/addressQuestion';
import { SelfIncomeQuestion } from './questions/selfIncomeQuestion';
import { QuestionList } from './questionList';
import { SpouseIncomeQuestion } from './questions/spouseIncomeQuestion';
import { ChildAgeQuestion } from './questions/childAgeQuestion';
import { DummyQuestion } from './questions/dummyQuestion';
import { SpouseExistsQuestion } from './questions/spouseExistsQuestion';
import { ChildrenNumQuestion } from './questions/childrenNumQuestion';
import { ParentNumQuestion } from './questions/parentNumQuestion';

// TODO: 災害関連見積もりの内容に修正
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
      title: '住宅被害の有無',
      component: <DummyQuestion key={2} />,
    },
    {
      title: '住宅被害状況',
      component: <DummyQuestion key={3} />,
    },
    {
      title: '再建方法',
      component: <DummyQuestion key={4} />,
    },
    {
      title: '家財の損害',
      component: <DummyQuestion key={5} />,
    },
    {
      title: '災害による負傷',
      component: <DummyQuestion key={6} />,
    },
    {
      title: '災害による障害',
      component: <DummyQuestion key={7} />,
    },
    {
      title: '世帯員が亡くなったかどうか',
      component: <DummyQuestion key={8} />,
    },
    {
      title: '亡くなった世帯員の人数',
      component: <DummyQuestion key={9} />,
    },
    {
      title: '生計維持者が亡くなったかどうか',
      component: <DummyQuestion key={10} />,
    },
    {
      title: '配偶者の有無',
      component: <SpouseExistsQuestion key={11} />,
    },
    {
      title: '子どもの人数',
      component: <ChildrenNumQuestion key={12} />,
    },
    {
      title: '親の人数',
      component: <ParentNumQuestion key={13} />,
    },
  ],
  配偶者: [
    {
      title: '年収',
      component: <SpouseIncomeQuestion key={0} />,
    },
    {
      title: '災害による負傷',
      component: <DummyQuestion key={1} />,
    },
    {
      title: '災害による障害',
      component: <DummyQuestion key={2} />,
    },
  ],
  子ども: [
    {
      title: '年齢',
      component: <ChildAgeQuestion key={0} />,
    },
    {
      title: '災害による負傷',
      component: <DummyQuestion key={1} />,
    },
    {
      title: '災害による障害',
      component: <DummyQuestion key={2} />,
    },
  ],
  親: [
    {
      title: '災害による負傷',
      component: <DummyQuestion key={0} />,
    },
    {
      title: '災害による障害',
      component: <DummyQuestion key={1} />,
    },
  ],
};

export const DisasterQuestionList = () => {
  return (
    <QuestionList
      questions={questions}
      isSimpleCalculation={false}
      isDisasterCalculation={true}
    />
  );
};

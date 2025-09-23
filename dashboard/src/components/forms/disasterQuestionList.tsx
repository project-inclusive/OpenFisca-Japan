import { AddressQuestion } from './questions/addressQuestion';
import { SelfIncome } from './questions/selfIncome';
import { QuestionList } from './questionList';
import { SpouseIncome } from './questions/spouseIncome';
import { ChildAgeQuestion } from './questions/childAgeQuestion';
import { ChildrenNumQuestion } from './questions/childrenNumQuestion';
import { HousingDamageExistsQuestion } from './questions/housingDamageExistsQuestion';
import { HousingDamageQuestion } from './questions/housingDamageQuestion';
import { HousingReconstructionQuestion } from './questions/housingReconstructionQuestion';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../state';
import { useEffect } from 'react';
import { HouseholdGoodsDamageQuestion } from './questions/householdGoodsDamageQuestion';
import { DeceasedNumberQuestion } from './questions/deceasedNumberQuestion';
import { DeceasedBreadwinnerQuestion } from './questions/deceasedBreadwinnerQuestion';
import { SelfDisasterInjuryQuestion } from './questions/selfDisasterInjuryQuestion';
import { SelfDisasterDisabilityQuestion } from './questions/selfDisasterDisabilityQuestion';
import { SpouseDisasterInjuryQuestion } from './questions/spouseDisasterInjuryQuestion';
import { SpouseDisasterDisabilityQuestion } from './questions/spouseDisasterDisabilityQuestion';
import { ChildDisasterInjuryQuestion } from './questions/childDisasterInjuryQuestion';
import { ChildDisasterDisabilityQuestion } from './questions/childDisasterDisabilityQuestion';
import { ParentDisasterDisabilityQuestion } from './questions/parentDisasterDisabilityQuestion';
import { ParentDisasterInjuryQuestion } from './questions/parentDisasterInjuryQuestion';
import { SimpleSpouseExistsQuestion } from './questions/simpleSpouseExistsQuestion';
import { DisasterParentNumQuestion } from './questions/disasterParentNumQuestion';
import { ParentIncome } from './questions/parentIncome';

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
      component: <SelfIncome key={1} />,
    },
    {
      title: '住宅被害の有無',
      component: <HousingDamageExistsQuestion key={2} />,
    },
    {
      title: '住宅被害状況',
      component: <HousingDamageQuestion key={3} />,
    },
    {
      title: '再建方法',
      component: <HousingReconstructionQuestion key={4} />,
    },
    {
      title: '家財の損害',
      component: <HouseholdGoodsDamageQuestion key={5} />,
    },
    {
      title: '災害による負傷',
      component: <SelfDisasterInjuryQuestion key={6} />,
    },
    {
      title: '災害による障害',
      component: <SelfDisasterDisabilityQuestion key={7} />,
    },
    {
      title: '亡くなった世帯員の人数',
      component: <DeceasedNumberQuestion key={8} />,
    },
    {
      title: '生計維持者が亡くなったかどうか',
      component: <DeceasedBreadwinnerQuestion key={9} />,
    },
    {
      title: '配偶者の有無',
      component: <SimpleSpouseExistsQuestion key={10} />,
    },
    {
      title: '子どもの人数',
      component: <ChildrenNumQuestion key={11} />,
    },
    {
      title: '親の人数',
      component: <DisasterParentNumQuestion key={12} />,
    },
  ],
  配偶者: [
    {
      title: '年収',
      component: <SpouseIncome key={0} />,
    },
    {
      title: '災害による負傷',
      component: <SpouseDisasterInjuryQuestion key={1} />,
    },
    {
      title: '災害による障害',
      component: <SpouseDisasterDisabilityQuestion key={2} />,
    },
  ],
  子ども: [
    {
      title: '年齢',
      component: <ChildAgeQuestion key={0} />,
    },
    {
      title: '災害による負傷',
      component: <ChildDisasterInjuryQuestion key={1} />,
    },
    {
      title: '災害による障害',
      component: <ChildDisasterDisabilityQuestion key={2} />,
    },
  ],
  親: [
    {
      title: '年収',
      component: <ParentIncome key={0} />,
    },
    {
      title: '災害による負傷',
      component: <ParentDisasterInjuryQuestion key={1} />,
    },
    {
      title: '災害による障害',
      component: <ParentDisasterDisabilityQuestion key={2} />,
    },
  ],
};

export const DisasterQuestionList = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  // 災害関連の制度が該当するよう設定
  useEffect(() => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.被災している = {
      [currentDate]: true,
    };
    newHousehold.世帯一覧.世帯1.災害救助法の適用地域である = {
      [currentDate]: true,
    };
    newHousehold.世帯一覧.世帯1.被災者生活再建支援法の適用地域である = {
      [currentDate]: true,
    };

    setHousehold({ ...newHousehold });
  }, []);

  return (
    <QuestionList
      questions={questions}
      isSimpleCalculation={false}
      isDisasterCalculation={true}
    />
  );
};

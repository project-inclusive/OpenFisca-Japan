import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentDateAtom,
  frontendHouseholdAtom,
  householdAtom,
  nextQuestionKeyAtom,
} from '../../../state';
import { PersonNumQuestion } from '../templates/personNumQuestion';
import configData from '../../../config/app_config.json';

export const DeceasedNumberQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const updatePersonInfo = (personNum: number) => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.災害で死亡した世帯員の人数 = {
      [currentDate]: personNum,
    };
    setHousehold({ ...newHousehold });

    // 次の質問を設定
    if (personNum === 0) {
      // 死亡した世帯員に関する質問を飛ばす
      setNextQuestionKey({
        person: 'あなた',
        personNum: 0,
        title: '配偶者の有無',
      });
    }
  };

  const defaultNum = (household: any) =>
    household.世帯一覧.世帯1.災害で死亡した世帯員の人数
      ? household.世帯一覧.世帯1.災害で死亡した世帯員の人数[currentDate]
      : 0;

  // TODO: defaultSectionに動的な値を設定するようにする
  return (
    <PersonNumQuestion
      updatePersonInfo={updatePersonInfo}
      defaultNum={defaultNum}
      maxPerson={configData.validation.household.maxChildren}
      title="家族に災害で亡くなった方はいますか？"
      defaultSelection={({ frontendHousehold }: { frontendHousehold: any }) =>
        null
      }
    />
  );
};

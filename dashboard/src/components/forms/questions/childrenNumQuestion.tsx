import { useRecoilState } from 'recoil';
import {
  frontendHouseholdAtom,
  householdAtom,
  nextQuestionKeyAtom,
} from '../../../state';
import { PersonNumQuestion } from '../templates/personNumQuestion';
import configData from '../../../config/app_config.json';

export const ChildrenNumQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  const updatePersonInfo = (personNum: number) => {
    const childrenNames = [...Array(personNum)].map(
      (val, i) => `子ども${i + 1}`
    );

    const newHousehold = { ...household };
    if (household.世帯一覧.世帯1.子一覧) {
      household.世帯一覧.世帯1.子一覧.map((childName: string) => {
        delete newHousehold.世帯員[childName];
      });
    }
    // 新しい子どもの情報を追加
    newHousehold.世帯一覧.世帯1.子一覧 = childrenNames;
    if (newHousehold.世帯一覧.世帯1.子一覧) {
      newHousehold.世帯一覧.世帯1.子一覧.map((childName: string) => {
        newHousehold.世帯員[childName] = {};
      });
    }
    setHousehold({ ...newHousehold });

    const newFrontendHousehold = { ...frontendHousehold };
    Object.keys(frontendHousehold.世帯員)
      .filter((name) => name.match('子ども'))
      .map((childName) => {
        delete newFrontendHousehold.世帯員[childName];
      });
    childrenNames.map((childName) => {
      newFrontendHousehold.世帯員[childName] = {};
    });
    setFrontendHousehold(newFrontendHousehold);

    // 次の質問を設定
    if (personNum === 0) {
      // 親の人数の質問へ
      setNextQuestionKey({
        person: 'あなた',
        personNum: 0,
        title: '親の人数',
      });
    } else {
      // 1人目の子どもの質問へ
      setNextQuestionKey({
        person: '子ども',
        personNum: 1,
        title: '年齢',
      });
    }
  };

  const filterPerson = (household: any) => household.世帯一覧.世帯1.子一覧;

  return (
    <PersonNumQuestion
      updatePersonInfo={updatePersonInfo}
      filterPerson={filterPerson}
      maxPerson={configData.validation.household.maxChildren}
      title="子どもの人数"
    />
  );
};

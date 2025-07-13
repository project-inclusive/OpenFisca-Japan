import { useRecoilState } from 'recoil';
import { householdAtom, nextQuestionKeyAtom } from '../../../state';
import { PersonNumQuestion } from '../templates/personNumQuestion';
import configData from '../../../config/app_config.json';

// HACK: 質問遷移先が異なるので別Component化
export const SimpleChildrenNumQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const updatePersonInfo = (personNum: number) => {
    const newHousehold = { ...household };
    if (household.世帯一覧.世帯1.子一覧) {
      household.世帯一覧.世帯1.子一覧.map((childName: string) => {
        delete newHousehold.世帯員[childName];
      });
    }

    // 新しい子どもの情報を追加
    newHousehold.世帯一覧.世帯1.子一覧 = [...Array(personNum)].map(
      (val, i) => `子ども${i + 1}`
    );
    if (newHousehold.世帯一覧.世帯1.子一覧) {
      newHousehold.世帯一覧.世帯1.子一覧.map((childName: string) => {
        newHousehold.世帯員[childName] = {};
      });
    }
    setHousehold({ ...newHousehold });

    // 次の質問を設定
    if (personNum === 0) {
      // 終了
      setNextQuestionKey(null);
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

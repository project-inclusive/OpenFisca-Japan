import { useRecoilState } from 'recoil';
import { householdAtom, nextQuestionKeyAtom } from '../../../state';
import { PersonNumQuestion } from '../templates/personNumQuestion';
import configData from '../../../config/app_config.json';

export const ParentNumQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const updatePersonInfo = (personNum: number) => {
    const newHousehold = { ...household };
    if (household.世帯一覧.世帯1.祖父母一覧) {
      household.世帯一覧.世帯1.祖父母一覧.map((parentName: string) => {
        delete newHousehold.世帯員[parentName];
      });
    }

    // 新しい子どもの情報を追加
    newHousehold.世帯一覧.世帯1.祖父母一覧 = [...Array(personNum)].map(
      (val, i) => `親${i + 1}`
    );
    if (newHousehold.世帯一覧.世帯1.祖父母一覧) {
      newHousehold.世帯一覧.世帯1.祖父母一覧.map((parentName: string) => {
        newHousehold.世帯員[parentName] = {};
      });
    }
    setHousehold({ ...newHousehold });

    // 次の質問を設定
    if (personNum === 0) {
      // 終了
      setNextQuestionKey(null);
    } else {
      // 1人目の親の質問へ
      setNextQuestionKey({
        person: '親',
        personNum: 1,
        title: '年齢',
      });
    }
  };

  const filterPerson = (household: any) => household.世帯一覧.世帯1.祖父母一覧;

  return (
    <PersonNumQuestion
      updatePersonInfo={updatePersonInfo}
      filterPerson={filterPerson}
      maxPerson={configData.validation.household.maxParents}
      title="親の人数"
    />
  );
};

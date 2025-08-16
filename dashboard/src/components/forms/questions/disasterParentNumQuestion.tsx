import { useRecoilState } from 'recoil';
import {
  frontendHouseholdAtom,
  householdAtom,
  nextQuestionKeyAtom,
} from '../../../state';
import { PersonNumQuestion } from '../templates/personNumQuestion';
import configData from '../../../config/app_config.json';

// HACK: 質問遷移先が異なるので別Component化
export const DisasterParentNumQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  const updatePersonInfo = (personNum: number) => {
    const parentNames = [...Array(personNum)].map((val, i) => `親${i + 1}`);

    const newHousehold = { ...household };
    if (household.世帯一覧.世帯1.祖父母一覧) {
      household.世帯一覧.世帯1.祖父母一覧.map((parentName: string) => {
        delete newHousehold.世帯員[parentName];
      });
    }

    // 新しい親の情報を追加
    newHousehold.世帯一覧.世帯1.祖父母一覧 = parentNames;
    if (newHousehold.世帯一覧.世帯1.祖父母一覧) {
      newHousehold.世帯一覧.世帯1.祖父母一覧.map((parentName: string) => {
        newHousehold.世帯員[parentName] = {};
      });
    }
    setHousehold({ ...newHousehold });

    const newFrontendHousehold = { ...frontendHousehold };
    Object.keys(frontendHousehold.世帯員)
      .filter((name) => name.match('親'))
      .map((parentName) => {
        delete newFrontendHousehold.世帯員[parentName];
      });
    parentNames.map((parentName) => {
      newFrontendHousehold.世帯員[parentName] = {};
    });
    setFrontendHousehold(newFrontendHousehold);

    // 次の質問を設定
    if (personNum === 0) {
      // 終了
      setNextQuestionKey(null);
    } else {
      // 1人目の親の質問へ
      setNextQuestionKey({
        person: '親',
        personNum: 1,
        title: '年収',
      });
    }
  };

  const defaultNum = (household: any) =>
    household.世帯一覧.世帯1.祖父母一覧
      ? household.世帯一覧.世帯1.祖父母一覧.length
      : 0;

  return (
    <PersonNumQuestion
      updatePersonInfo={updatePersonInfo}
      defaultNum={defaultNum}
      maxPerson={configData.validation.household.maxParents}
      title="親の人数"
    />
  );
};

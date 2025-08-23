import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import {
  frontendHouseholdAtom,
  householdAtom,
  nextQuestionKeyAtom,
} from '../../../state';
import { PersonNumQuestion } from '../templates/personNumQuestion';
import configData from '../../../config/app_config.json';

// HACK: 質問遷移先が異なるので別Component化
export const SimpleChildrenNumQuestion = () => {
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

    // 質問の選択状態を設定
    newFrontendHousehold.世帯['子どもの人数'] = personNum;

    setFrontendHousehold(newFrontendHousehold);

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

  const defaultNum = (household: any) => household.世帯一覧.世帯1.子一覧.length;

  const isAlreadySelected = (frontendHousehold: any): boolean | null => {
    if (frontendHousehold.世帯['子どもの人数'] != null) {
      return frontendHousehold.世帯['子どもの人数'] !== 0;
    }
    return null;
  };

  useEffect(() => {
    if (isAlreadySelected(frontendHousehold) !== null) {
      if (isAlreadySelected(frontendHousehold)) {
        setNextQuestionKey({
          person: '子ども',
          personNum: 1,
          title: '年齢',
        });
      } else {
        setNextQuestionKey(null);
      }
    }
  }, []);

  return (
    <PersonNumQuestion
      updatePersonInfo={updatePersonInfo}
      defaultNum={defaultNum}
      maxPerson={configData.validation.household.maxChildren}
      title="子どもの人数"
      defaultSelection={({ frontendHousehold }: { frontendHousehold: any }) =>
        isAlreadySelected(frontendHousehold)
      }
      defaultPersonNumber={({
        frontendHousehold,
      }: {
        frontendHousehold: any;
      }) => {
        if (frontendHousehold.世帯['子どもの人数'] != null) {
          return frontendHousehold.世帯['子どもの人数'];
        }
        return 0;
      }}
    />
  );
};

import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import {
  currentDateAtom,
  frontendHouseholdAtom,
  householdAtom,
  nextQuestionKeyAtom,
} from '../../../state';

export const SpouseExistsQuestion = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    if (newHousehold.世帯一覧.世帯1.親一覧.length == 1) {
      newHousehold.世帯員['配偶者'] = {};
      newHousehold.世帯一覧.世帯1.親一覧.push('配偶者');
    }
    setHousehold(newHousehold);

    const newFrontendHousehold = { ...frontendHousehold };
    newFrontendHousehold.世帯員['配偶者'] = {};
    setFrontendHousehold(newFrontendHousehold);

    setNextQuestionKey({
      person: '配偶者',
      personNum: 0,
      title: '年齢',
    });
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    delete newHousehold.世帯員['配偶者'];
    const spouseIdx = newHousehold.世帯一覧.世帯1.親一覧.indexOf('配偶者');
    if (spouseIdx !== -1) {
      newHousehold.世帯一覧.世帯1.親一覧.splice(spouseIdx, 1);
      newHousehold.世帯一覧.世帯1.配偶者がいるがひとり親に該当 = {
        [currentDate]: false,
      };
    }
    setHousehold(newHousehold);

    const newFrontendHousehold = { ...frontendHousehold };
    delete newFrontendHousehold.世帯員['配偶者'];
    setFrontendHousehold(newFrontendHousehold);

    // 配偶者がいないので、子どもの質問までスキップ
    setNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: '子どもの人数',
    });
  };

  return (
    <YesNoQuestion
      title="配偶者はいますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員['配偶者'] ? true : null
      }
    />
  );
};

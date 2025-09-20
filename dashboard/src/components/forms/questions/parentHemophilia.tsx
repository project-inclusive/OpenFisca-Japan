import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import {
  frontendHouseholdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';

export const ParentHemoPhilia = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 血液凝固因子異常症関連の質問をスキップ
    if (frontendHousehold.世帯員[`親${questionKey.personNum}`]['障害がある']) {
      setNextQuestionKey({
        person: '親',
        personNum: questionKey.personNum,
        title: '身体障害者手帳',
      });
    } else {
      setNextQuestionKey({
        person: '親',
        personNum: questionKey.personNum,
        title: '介護施設',
      });
    }
  };

  return (
    <YesNoQuestion
      title="先天性の血液凝固因子異常症（血友病等）ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

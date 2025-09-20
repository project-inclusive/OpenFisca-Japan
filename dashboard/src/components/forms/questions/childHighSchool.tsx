import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import {
  frontendHouseholdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';

export const ChildHighSchool = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 高校関連の質問をスキップ
    setNextQuestionKey({
      person: '子ども',
      personNum: questionKey.personNum,
      title: '仕事の有無',
    });
  };

  return (
    <YesNoQuestion
      title="高校に通っていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

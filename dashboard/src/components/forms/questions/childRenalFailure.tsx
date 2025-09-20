import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';

export const ChildRenalFailure = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 仕事関連の質問をスキップ
    setNextQuestionKey({
      person: '子ども',
      personNum: questionKey.personNum,
      title: '血液凝固因子異常症の有無',
    });
  };

  return (
    <YesNoQuestion
      title="腎不全ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={() => null}
    />
  );
};

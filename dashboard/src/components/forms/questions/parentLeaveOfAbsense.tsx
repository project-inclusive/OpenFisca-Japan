import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';

export const ParentLeaveOfAbsense = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 休業関連の質問をスキップ
    setNextQuestionKey({
      person: '親',
      personNum: questionKey.personNum,
      title: '病気、けが、障害',
    });
  };

  return (
    <YesNoQuestion
      // 人に対する「休業中」という表現がなじみが薄いので、UI上の文章は「休職中」にする
      title="休職中ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

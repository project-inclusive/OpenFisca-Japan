import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const SpouseLeaveOfAbsense = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 休業関連の質問をスキップ
    setNextQuestionKey({
      person: '配偶者',
      personNum: 0,
      title: '病気、けが、障害',
    });
  };

  return (
    <YesNoQuestion
      title="休業中ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={() => null}
    />
  );
};

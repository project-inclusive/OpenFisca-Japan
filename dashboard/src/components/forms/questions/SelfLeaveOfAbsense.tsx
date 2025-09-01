import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const SelfLeaveOfAbsense = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {};
  const noOnClick = () => {
    // 休業関連の質問をスキップ
    setNextQuestionKey({
      person: 'あなた',
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

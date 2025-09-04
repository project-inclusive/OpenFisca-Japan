import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const SpouseWorkQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 仕事関連の質問をスキップ
    setNextQuestionKey({
      person: '配偶者',
      personNum: 0,
      title: '病気、けが、障害',
    });
  };

  return (
    <YesNoQuestion
      title="現在仕事をしていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={() => null}
    />
  );
};

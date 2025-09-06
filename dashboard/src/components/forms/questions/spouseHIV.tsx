import { useRecoilState } from 'recoil';
import { nextQuestionKeyAtom } from '../../../state';
import { HIV } from './hiv';

export const SpouseHIV = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesUpdateNextQuestion = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noUpdateNextQuestion = () => {
    // 仕事関連の質問をスキップ
    setNextQuestionKey({
      person: '配偶者',
      personNum: 0,
      title: 'C型肝炎',
    });
  };

  return (
    <HIV
      personName="配偶者"
      yesUpdateNextQuestion={yesUpdateNextQuestion}
      noUpdateNextQuestion={noUpdateNextQuestion}
    />
  );
};

import { useRecoilState, useRecoilValue } from 'recoil';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';
import { HIV } from './hiv';

export const ParentHIV = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesUpdateNextQuestion = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noUpdateNextQuestion = () => {
    // 仕事関連の質問をスキップ
    setNextQuestionKey({
      person: '親',
      personNum: questionKey.personNum,
      title: 'C型肝炎',
    });
  };

  return (
    <HIV
      personName={`親${questionKey.personNum}`}
      yesUpdateNextQuestion={yesUpdateNextQuestion}
      noUpdateNextQuestion={noUpdateNextQuestion}
    />
  );
};

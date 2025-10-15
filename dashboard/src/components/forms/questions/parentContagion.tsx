import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';

export const ParentContagion = () => {
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
      person: '親',
      personNum: questionKey.personNum,
      title: '腎不全',
    });
  };

  return (
    <YesNoQuestion
      title="感染症にかかっていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

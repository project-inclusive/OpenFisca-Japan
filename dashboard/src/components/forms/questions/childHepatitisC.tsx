import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';

export const ChildHepatitisC = () => {
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
      title: '腎不全',
    });
  };

  return (
    <YesNoQuestion
      title="C型肝炎に感染していますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

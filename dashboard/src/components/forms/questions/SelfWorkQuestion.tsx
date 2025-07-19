import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import {
  currentDateAtom,
  householdAtom,
  nextQuestionKeyAtom,
  questionValidatedAtom,
} from '../../../state';

export const SelfWorkQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {};
  const noOnClick = () => {
    // 仕事関連の質問をスキップ
    setNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: '配偶者の有無',
    });
  };

  return (
    <YesNoQuestion
      title="現在仕事をしていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={(household: any) => null}
    />
  );
};

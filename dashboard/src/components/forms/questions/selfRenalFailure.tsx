import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const SelfRenalFailure = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {
    // スキップしない
    setNextQuestionKey(null);
  };
  const noOnClick = () => {
    // 仕事関連の質問をスキップ
    setNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: '血液凝固因子異常症の有無',
    });
  };

  return (
    <YesNoQuestion
      title="腎不全ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

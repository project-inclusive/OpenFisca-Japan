import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const SpouseHepatitisC = () => {
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

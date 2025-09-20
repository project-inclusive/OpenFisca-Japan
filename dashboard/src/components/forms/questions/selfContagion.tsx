import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const SelfContagion = () => {
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
      title: '腎不全',
    });
  };

  return (
    <YesNoQuestion
      title="感染症にかかっていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={() => null}
    />
  );
};

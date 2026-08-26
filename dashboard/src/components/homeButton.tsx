import {
  defaultNextQuestionKeyAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
  questionKeyHistoryAtom,
  resetQuestionKeys,
} from '../state';
import { useSetRecoilState } from 'recoil';
import { HomeLink } from './navigation/HomeLink';

export const HomeButton = () => {
  const setQuestionKey = useSetRecoilState(questionKeyAtom);
  const setNextQuestionKey = useSetRecoilState(nextQuestionKeyAtom);
  const setDefaultNextQuestionKey = useSetRecoilState(
    defaultNextQuestionKeyAtom
  );
  const setQuestionKeyHistory = useSetRecoilState(questionKeyHistoryAtom);

  const onClick = () => {
    // 質問の1問目に戻る
    // (戻さないと別の見積もりモードへ移った際に想定外の設問から始まってしまうため)
    resetQuestionKeys({
      setQuestionKey,
      setNextQuestionKey,
      setDefaultNextQuestionKey,
      setQuestionKeyHistory,
    });
  };

  return <HomeLink onClick={onClick} />;
};

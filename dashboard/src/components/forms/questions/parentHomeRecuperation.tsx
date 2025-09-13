import { useRecoilState, useRecoilValue } from 'recoil';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';
import { HomeRecuperation } from './homeRecuperation';

export const ParentHomeRecuperation = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const personName = `親${questionKey.personNum}`;

  // 状態遷移先の質問を設定
  // HACK: 選択肢とは独立した条件式なので、enable, disableとは別の関数に切り出して処理
  const updateNextQuestionKey = (frontendHousehold: any) => {
    if (frontendHousehold.世帯員[personName]['病気がある']) {
      // スキップしない
      setNextQuestionKey(null);
      return;
    }

    if (frontendHousehold.世帯員[personName]['障害がある']) {
      // 病気の質問を飛ばす
      setNextQuestionKey({
        person: '親',
        personNum: questionKey.personNum,
        title: '身体障害者手帳',
      });
      return;
    }

    // 病気と障害の質問を飛ばす
    setNextQuestionKey({
      person: '親',
      personNum: questionKey.personNum,
      title: '介護施設',
    });
  };

  return (
    <HomeRecuperation
      personName={`親${questionKey.personNum}`}
      updateNextQuestionKey={updateNextQuestionKey}
    />
  );
};

import { useRecoilState, useRecoilValue } from 'recoil';
import { nextQuestionKeyAtom, questionKeyAtom } from '../../../state';
import { HemoPhiliaKind } from './hemoPhiliaKind';

export const ParentHemophiliaKind = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const personName = `親${questionKey.personNum}`;

  // 状態遷移先の質問を設定
  // HACK: 選択肢とは独立した条件式なので、enable, disableとは別の関数に切り出して処理
  const updateNextQuestionKey = (frontendHousehold: any) => {
    if (frontendHousehold.世帯員[personName]['障害がある']) {
      // スキップしない
      setNextQuestionKey(null);
      return;
    }

    // 障害の質問を飛ばす
    setNextQuestionKey({
      person: '親',
      personNum: questionKey.personNum,
      title: '介護施設',
    });
  };

  return (
    <HemoPhiliaKind
      personName={personName}
      updateNextQuestionKey={updateNextQuestionKey}
    />
  );
};

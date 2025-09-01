import { useRecoilState, useRecoilValue } from 'recoil';
import { frontendHouseholdAtom, nextQuestionKeyAtom } from '../../../state';
import { useEffect } from 'react';
import { HealthCondition } from './healthCondition';

export const SelfHealthCondition = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);

  // 状態遷移先の質問を設定
  // HACK: 選択の組み合わせによって決定するため、enable, disableとは別の関数に切り出して処理
  const updateNextQuestionKey = (frontendHousehold: any) => {
    if (
      frontendHousehold.世帯員['あなた']['病気がある'] ||
      frontendHousehold.世帯員['あなた']['けがをしている']
    ) {
      // スキップしない
      return;
    }

    if (frontendHousehold.世帯員['あなた']['障害がある']) {
      // 病気、けがの質問を飛ばし障害の質問へ
      setNextQuestionKey({
        person: 'あなた',
        personNum: 0,
        title: '身体障害者手帳',
      });
      return;
    }

    // 病気、けが、障害の質問を飛ばす
    setNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: '介護施設',
    });
  };

  useEffect(() => {
    updateNextQuestionKey(frontendHousehold);
  }, [frontendHousehold]);

  return (
    <HealthCondition
      personName="あなた"
      updateNextQuestionKey={updateNextQuestionKey}
    />
  );
};

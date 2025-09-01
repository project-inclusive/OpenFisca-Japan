import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';
import { useEffect } from 'react';
import { HealthCondition } from './healthCondition';

export const ChildHealthCondition = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);

  const personName = `子ども${questionKey.personNum}`;

  // 状態遷移先の質問を設定
  // HACK: 選択の組み合わせによって決定するため、enable, disableとは別の関数に切り出して処理
  const updateNextQuestionKey = (frontendHousehold: any) => {
    if (
      frontendHousehold.世帯員[personName]['病気がある'] ||
      frontendHousehold.世帯員[personName]['けがをしている']
    ) {
      // スキップしない
      return;
    }

    if (frontendHousehold.世帯員[personName]['障害がある']) {
      // 病気、けがの質問を飛ばし障害の質問へ
      setNextQuestionKey({
        person: '親',
        personNum: questionKey.personNum,
        title: '身体障害者手帳',
      });
      return;
    }

    // 病気、けが、障害の質問を飛ばす
    setNextQuestionKey({
      person: '親',
      personNum: questionKey.personNum,
      title: '介護施設',
    });
  };

  useEffect(() => {
    updateNextQuestionKey(frontendHousehold);
  }, [frontendHousehold]);

  return (
    <HealthCondition
      personName={personName}
      updateNextQuestionKey={updateNextQuestionKey}
    />
  );
};

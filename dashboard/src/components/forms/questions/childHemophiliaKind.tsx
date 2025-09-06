import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';
import { HemoPhiliaKind } from './hemoPhiliaKind';
import { useEffect } from 'react';

export const ChildHemophiliaKind = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const personName = `子ども${questionKey.personNum}`;

  useEffect(
    () => {
      if (frontendHousehold.世帯員[personName]['障害がある']) {
        // スキップしない
        setNextQuestionKey(null);
        return;
      }

      // 障害の質問を飛ばす
      setNextQuestionKey({
        person: '子ども',
        personNum: questionKey.personNum,
        title: '介護施設',
      });
    },
    // HACK: 前のページから戻ってきた際に再度スキップできるよう、questionKeyが変わるたびに再実施できるようにする
    [questionKey]
  );

  return <HemoPhiliaKind personName={personName} />;
};

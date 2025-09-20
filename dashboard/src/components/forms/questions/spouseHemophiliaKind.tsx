import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';
import { HemoPhiliaKind } from './hemoPhiliaKind';
import { useEffect } from 'react';

export const SpouseHemophiliaKind = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  useEffect(
    () => {
      if (frontendHousehold.世帯員['あなた']['障害がある']) {
        // スキップしない
        setNextQuestionKey(null);
        return;
      }

      // 障害の質問を飛ばす
      setNextQuestionKey({
        person: 'あなた',
        personNum: 0,
        title: '介護施設',
      });
    },
    // HACK: 前のページから戻ってきた際に再度スキップできるよう、questionKeyが変わるたびに再実施できるようにする
    [questionKey]
  );

  return <HemoPhiliaKind personName={'配偶者'} />;
};

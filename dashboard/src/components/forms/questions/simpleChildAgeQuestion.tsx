import { useRecoilState, useRecoilValue } from 'recoil';
import {
  householdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';
import { ChildrenAgeQuestion } from '../templates/childrenAgeQuestion';
import { useEffect } from 'react';

export const SimpleChildAgeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const household = useRecoilValue(householdAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const personName = `子ども${questionKey.personNum}`;

  useEffect(() => {
    // この質問が最後
    setNextQuestionKey(null);
  }, [household]);

  return <ChildrenAgeQuestion personName={personName} />;
};

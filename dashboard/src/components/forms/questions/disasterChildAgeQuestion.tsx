import { useRecoilState, useRecoilValue } from 'recoil';
import {
  householdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';
import { ChildrenAgeQuestion } from '../templates/childrenAgeQuestion';

export const DisasterChildAgeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  useRecoilState(nextQuestionKeyAtom);
  const personName = `子ども${questionKey.personNum}`;

  return <ChildrenAgeQuestion personName={personName} />;
};

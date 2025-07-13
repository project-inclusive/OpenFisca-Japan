import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { ChildrenAgeQuestion } from '../templates/childrenAgeQuestion';

export const ChildAgeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <ChildrenAgeQuestion personName={`子ども${questionKey.personNum}`} />;
};

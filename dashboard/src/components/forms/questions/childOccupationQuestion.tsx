import { useRecoilValue } from 'recoil';
import { OccupationQuestion } from './occupationQuestion';
import { questionKeyAtom } from '../../../state';

export const ChildOccupationQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <OccupationQuestion personName={`子ども${questionKey.personNum}`} />;
};

import { useRecoilValue } from 'recoil';
import { OccupationQuestion } from './occupationQuestion';
import { questionKeyAtom } from '../../../state';

export const ParentOccupationQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <OccupationQuestion personName={`親${questionKey.personNum}`} />;
};

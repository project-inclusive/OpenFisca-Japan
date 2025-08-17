import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { MentalDisability } from './mentalDisability';

export const ParentMentalDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <MentalDisability personName={`親${questionKey.personNum}`} />;
};

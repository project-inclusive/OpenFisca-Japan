import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { MentalDisability } from './mentalDisability';

export const ChildMentalDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <MentalDisability personName={`子ども${questionKey.personNum}`} />;
};

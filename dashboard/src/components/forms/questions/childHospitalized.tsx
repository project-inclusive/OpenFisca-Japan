import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Hospitalized } from './hospitalized';

export const ChildHospitalized = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Hospitalized personName={`子ども${questionKey.personNum}`} />;
};

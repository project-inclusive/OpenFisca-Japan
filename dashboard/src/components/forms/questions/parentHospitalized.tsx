import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Hospitalized } from './hospitalized';

export const ParentHospitalized = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Hospitalized personName={`親${questionKey.personNum}`} />;
};

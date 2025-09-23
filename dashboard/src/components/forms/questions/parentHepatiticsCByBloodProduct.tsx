import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { HepatitisCByBloodProduct } from './hepatitisCByBloodProduct';

export const ParentHepatitisCByBloodProduct = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <HepatitisCByBloodProduct personName={`親${questionKey.personNum}`} />;
};

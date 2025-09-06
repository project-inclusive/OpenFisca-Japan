import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { HepatitisCByBloodProduct } from './hepatitisCByBloodProduct';

export const ChildHepatitisCByBloodProduct = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <HepatitisCByBloodProduct personName={`子ども${questionKey.personNum}`} />
  );
};

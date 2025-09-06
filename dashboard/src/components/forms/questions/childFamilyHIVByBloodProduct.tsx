import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { FamilyHIVByBloodProduct } from './familyHIVByBloodProduct';

export const ChildFamilyHIVByBloodProduct = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <FamilyHIVByBloodProduct personName={`子ども${questionKey.personNum}`} />
  );
};

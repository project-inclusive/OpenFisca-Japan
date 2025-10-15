import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { FamilyHIVByBloodProduct } from './familyHIVByBloodProduct';

export const ParentFamilyHIVByBloodProduct = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <FamilyHIVByBloodProduct personName={`親${questionKey.personNum}`} />;
};

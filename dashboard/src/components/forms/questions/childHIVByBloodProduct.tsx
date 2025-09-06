import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { HIVByBloodProduct } from './hivByBloodProduct';

export const ChildHIVByBloodProduct = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <HIVByBloodProduct personName={`子ども${questionKey.personNum}`} />;
};

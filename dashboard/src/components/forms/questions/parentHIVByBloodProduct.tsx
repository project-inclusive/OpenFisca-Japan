import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { HIVByBloodProduct } from './hivByBloodProduct';

export const ParentHIVByBloodProduct = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <HIVByBloodProduct personName={`親${questionKey.personNum}`} />;
};

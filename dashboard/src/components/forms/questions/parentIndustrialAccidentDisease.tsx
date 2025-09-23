import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { IndustrialAccident } from './industrialAccident';

export const ParentIndustrialAccident = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <IndustrialAccident personName={`親${questionKey.personNum}`} />;
};

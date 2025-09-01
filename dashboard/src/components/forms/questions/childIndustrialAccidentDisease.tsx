import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { IndustrialAccident } from './industrialAccident';

export const ChildIndustrialAccident = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <IndustrialAccident personName={`子ども${questionKey.personNum}`} />;
};

import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Dialysis } from './dialysis';

export const ParentDialysis = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Dialysis personName={`親${questionKey.personNum}`} />;
};

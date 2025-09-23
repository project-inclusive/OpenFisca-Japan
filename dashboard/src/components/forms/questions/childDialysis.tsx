import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Dialysis } from './dialysis';

export const ChildDialysis = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Dialysis personName={`子ども${questionKey.personNum}`} />;
};

import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { NursingHome } from './nursingHome';

export const ChildNursingHome = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <NursingHome personName={`子ども${questionKey.personNum}`} />;
};

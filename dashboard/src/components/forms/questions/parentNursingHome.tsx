import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { NursingHome } from './nursingHome';

export const ParentNursingHome = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <NursingHome personName={`親${questionKey.personNum}`} />;
};

import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Student } from './student';

export const ParentStudent = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Student personName={`親${questionKey.personNum}`} />;
};

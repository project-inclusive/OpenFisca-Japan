import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { NewJob } from './newJob';

export const ParentNewJob = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <NewJob personName={`親${questionKey.personNum}`} />;
};

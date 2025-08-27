import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { NewJob } from './newJob';

export const ChildNewJob = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <NewJob personName={`子ども${questionKey.personNum}`} />;
};

import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { DisasterDisabilityQuestion } from './disasterDisabilityQuestion';

export const ChildDisasterDisabilityQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <DisasterDisabilityQuestion personName={`子ども${questionKey.personNum}`} />
  );
};

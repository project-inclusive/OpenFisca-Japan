import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { DisasterDisabilityQuestion } from './disasterDisabilityQuestion';

export const ParentDisasterDisabilityQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <DisasterDisabilityQuestion personName={`親${questionKey.personNum}`} />
  );
};

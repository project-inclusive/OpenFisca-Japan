import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { DisasterInjuryQuestion } from './disasterInjuryQuestion';

export const ChildDisasterInjuryQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <DisasterInjuryQuestion personName={`子ども${questionKey.personNum}`} />
  );
};

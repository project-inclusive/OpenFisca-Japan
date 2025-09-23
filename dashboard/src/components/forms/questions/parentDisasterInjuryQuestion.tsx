import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { DisasterInjuryQuestion } from './disasterInjuryQuestion';

export const ParentDisasterInjuryQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <DisasterInjuryQuestion personName={`親${questionKey.personNum}`} />;
};

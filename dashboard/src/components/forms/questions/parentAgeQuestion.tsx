import { useRecoilValue } from 'recoil';
import { AgeQuestion } from '../templates/ageQuestion';
import { questionKeyAtom } from '../../../state';

export const ParentAgeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);

  return <AgeQuestion personName={`親${questionKey.personNum}`} />;
};

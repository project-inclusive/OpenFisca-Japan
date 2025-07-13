import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { IncomeQuestion } from '../templates/incomeQuestion';

export const ChildIncomeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <IncomeQuestion personName={`子ども${questionKey.personNum}`} />;
};

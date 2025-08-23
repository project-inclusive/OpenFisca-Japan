import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { IncomeQuestion } from '../templates/incomeQuestion';

export const ParentIncomeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <IncomeQuestion personName={`親${questionKey.personNum}`} />;
};

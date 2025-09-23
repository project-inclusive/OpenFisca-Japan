import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Income } from './income';

export const ParentIncome = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Income personName={`親${questionKey.personNum}`} />;
};

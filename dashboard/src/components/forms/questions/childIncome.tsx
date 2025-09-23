import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Income } from './income';

export const ChildIncome = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Income personName={`子ども${questionKey.personNum}`} />;
};

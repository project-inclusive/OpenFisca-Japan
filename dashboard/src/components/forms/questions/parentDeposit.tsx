import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Deposit } from './deposit';

export const ParentDeposit = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Deposit personName={`親${questionKey.personNum}`} />;
};

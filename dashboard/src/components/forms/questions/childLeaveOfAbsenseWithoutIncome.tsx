import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { LeaveOfAbsenseWithoutIncome } from './leaveOfAbsenseWithoutIncome';

export const ChildLeaveOfAbsenseWithoutIncome = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <LeaveOfAbsenseWithoutIncome
      personName={`子ども${questionKey.personNum}`}
    />
  );
};

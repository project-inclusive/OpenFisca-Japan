import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { LeaveOfAbsenseWithoutIncome } from './leaveOfAbsenseWithoutIncome';

export const ParentLeaveOfAbsenseWithoutIncome = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <LeaveOfAbsenseWithoutIncome personName={`親${questionKey.personNum}`} />
  );
};

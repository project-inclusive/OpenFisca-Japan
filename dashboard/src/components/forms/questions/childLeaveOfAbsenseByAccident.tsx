import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { LeaveOfAbsenseByAccident } from './leaveOfAbsenseByAccident';

export const ChildLeaveOfAbsenseByAccident = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <LeaveOfAbsenseByAccident personName={`子ども${questionKey.personNum}`} />
  );
};

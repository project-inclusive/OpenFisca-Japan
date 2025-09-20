import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { LeaveOfAbsenseByAccident } from './leaveOfAbsenseByAccident';

export const ParentLeaveOfAbsenseByAccident = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <LeaveOfAbsenseByAccident personName={`親${questionKey.personNum}`} />;
};

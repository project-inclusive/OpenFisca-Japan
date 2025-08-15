import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { PhysicalDisability } from '../templates/physicalDisability';

export const ParentPhysicalDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <PhysicalDisability personName={`親${questionKey.personNum}`} />;
};

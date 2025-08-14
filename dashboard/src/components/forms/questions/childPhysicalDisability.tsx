import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from "../../../state";
import { PhysicalDisability } from '../templates/physicalDisability';

export const ChildPhysicalDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <PhysicalDisability personName={`子ども${questionKey.personNum}`} />;
};

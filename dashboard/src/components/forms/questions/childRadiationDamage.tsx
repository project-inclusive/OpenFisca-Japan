import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { RadiationDamage } from "./radiationDamage";

export const ChildRadiationDamage = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <RadiationDamage personName={`子ども${questionKey.personNum}`} />;
};

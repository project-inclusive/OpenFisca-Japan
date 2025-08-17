import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { RadiationDamage } from "./radiationDamage";

export const ParentRadiationDamage = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <RadiationDamage personName={`親${questionKey.personNum}`} />;
};

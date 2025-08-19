import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { CerebralParalysis } from "./cerebralParalysis";

export const ParentCerebralParalysis = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <CerebralParalysis personName={`親${questionKey.personNum}`} />;
};

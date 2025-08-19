import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { CerebralParalysis } from "./cerebralParalysis";

export const ChildCerebralParalysis = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <CerebralParalysis personName={`子ども${questionKey.personNum}`} />;
};

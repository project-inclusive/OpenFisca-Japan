import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { InternalDisability } from './internalDisability';

export const ChildInternalDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <InternalDisability personName={`子ども${questionKey.personNum}`} />;
};

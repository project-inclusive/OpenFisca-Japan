import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { InternalDisability } from './internalDisability';

export const ParentInternalDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <InternalDisability personName={`親${questionKey.personNum}`} />;
};

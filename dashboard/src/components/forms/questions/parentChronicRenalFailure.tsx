import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { ChronicRenalFailure } from './chronicRenalFailure';

export const ParentChronicRenalFailure = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <ChronicRenalFailure personName={`親${questionKey.personNum}`} />;
};

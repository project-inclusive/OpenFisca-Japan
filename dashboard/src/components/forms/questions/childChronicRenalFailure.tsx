import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { ChronicRenalFailure } from './chronicRenalFailure';

export const ChildChronicRenalFailure = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <ChronicRenalFailure personName={`子ども${questionKey.personNum}`} />;
};

import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { HomeRecuperation } from './homeRecuperation';

export const ChildHomeRecuperation = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <HomeRecuperation personName={`子ども${questionKey.personNum}`} />;
};

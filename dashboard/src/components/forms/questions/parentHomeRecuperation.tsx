import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { HomeRecuperation } from './homeRecuperation';

export const ParentHomeRecuperation = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <HomeRecuperation personName={`親${questionKey.personNum}`} />;
};

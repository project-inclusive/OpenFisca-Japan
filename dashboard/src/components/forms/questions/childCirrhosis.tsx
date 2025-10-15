import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Cirrhosis } from './cirrhosis';

export const ChildCirrhosis = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Cirrhosis personName={`子ども${questionKey.personNum}`} />;
};

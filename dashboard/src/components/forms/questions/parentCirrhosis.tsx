import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { Cirrhosis } from './cirrhosis';

export const ParentCirrhosis = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <Cirrhosis personName={`親${questionKey.personNum}`} />;
};

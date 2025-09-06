import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { AIDS } from './aids';

export const ParentAIDS = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <AIDS personName={`親${questionKey.personNum}`} />;
};

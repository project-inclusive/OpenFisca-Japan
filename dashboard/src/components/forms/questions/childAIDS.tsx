import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { AIDS } from './aids';

export const ChildAIDS = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <AIDS personName={`子ども${questionKey.personNum}`} />;
};

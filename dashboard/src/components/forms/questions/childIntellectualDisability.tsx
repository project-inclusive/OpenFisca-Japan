import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { IntellectualDisability } from './intellectualDisability';

export const ChildIntellectualDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return (
    <IntellectualDisability personName={`子ども${questionKey.personNum}`} />
  );
};

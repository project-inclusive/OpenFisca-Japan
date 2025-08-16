import { useRecoilValue } from 'recoil';
import { questionKeyAtom } from '../../../state';
import { IntellectualDisability } from './intellectualDisability';

export const ParentIntellectualDisability = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  return <IntellectualDisability personName={`親${questionKey.personNum}`} />;
};

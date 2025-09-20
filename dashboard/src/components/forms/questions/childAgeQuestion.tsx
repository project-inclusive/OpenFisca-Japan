import { useRecoilState, useRecoilValue } from 'recoil';
import {
  householdAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
} from '../../../state';
import { ChildrenAgeQuestion } from '../templates/childrenAgeQuestion';
import { useEffect } from 'react';

export const ChildAgeQuestion = () => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const household = useRecoilValue(householdAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const personName = `子ども${questionKey.personNum}`;

  useEffect(() => {
    const birthdayObj = household.世帯員[personName].誕生年月日;
    if (birthdayObj == null) {
      return;
    }
    const age =
      new Date().getFullYear() - new Date(birthdayObj?.ETERNITY).getFullYear();
    if (age < 15) {
      // 高校関連の質問をスキップ
      setNextQuestionKey({
        person: '子ども',
        personNum: questionKey.personNum,
        title: '仕事の有無',
      });
    } else {
      // スキップしない
      setNextQuestionKey(null);
    }
  }, [household]);

  return <ChildrenAgeQuestion personName={personName} />;
};

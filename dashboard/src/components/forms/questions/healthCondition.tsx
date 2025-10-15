import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentDateAtom,
  frontendHouseholdAtom,
  householdAtom,
  questionKeyAtom,
} from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';
import { useEffect } from 'react';

export const HealthCondition = ({
  personName,
  updateNextQuestionKey,
}: {
  personName: string;
  updateNextQuestionKey: (frontendHousehold: any) => void;
}) => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  // 感染症関連の質問がスキップされた場合も値が欠けないよう、デフォルト値のfalseを挿入
  // （当てはまる場合は、後の当該質問でtrueに上書きされる）
  useEffect(() => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].HIV感染者である = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
  }, [questionKey]);

  const selectionValues = ['病気がある', 'けがをしている', '障害がある'];

  const selections = selectionValues.map((value) => ({
    selection: value,
    enable: () => {
      const copiedFrontendHousehold = { ...frontendHousehold };
      copiedFrontendHousehold.世帯員[personName][value] = true;
      setFrontendHousehold(copiedFrontendHousehold);
      updateNextQuestionKey(copiedFrontendHousehold);
    },
    disable: () => {
      const copiedFrontendHousehold = { ...frontendHousehold };
      copiedFrontendHousehold.世帯員[personName][value] = false;
      setFrontendHousehold(copiedFrontendHousehold);
      updateNextQuestionKey(copiedFrontendHousehold);
    },
  }));

  return (
    <MultipleSelectionQuestion
      title="病気やけが、障害はありますか？"
      selections={selections}
    />
  );
};

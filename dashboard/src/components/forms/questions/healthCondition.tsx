import { useRecoilState } from 'recoil';
import { frontendHouseholdAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';
import { useEffect } from 'react';

export const HealthCondition = ({
  personName,
  updateNextQuestionKey,
}: {
  personName: string;
  updateNextQuestionKey: (frontendHousehold: any) => void;
}) => {
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

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

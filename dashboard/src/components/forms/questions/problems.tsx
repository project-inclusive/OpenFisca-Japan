import { useRecoilState } from 'recoil';
import { frontendHouseholdAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';

export const Problems = () => {
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  const selectionValues = Object.keys(frontendHousehold.困りごと);

  const selections = selectionValues.map((value) => ({
    selection: value,
    enable: () => {
      const copiedFrontendHousehold = { ...frontendHousehold };
      copiedFrontendHousehold.困りごと[value] = true;
      setFrontendHousehold(copiedFrontendHousehold);
    },
    disable: () => {
      const copiedFrontendHousehold = { ...frontendHousehold };
      copiedFrontendHousehold.困りごと[value] = false;
      setFrontendHousehold(copiedFrontendHousehold);
    },
  }));

  const defaultSelections = ({
    frontendHousehold,
  }: {
    frontendHousehold: any;
  }) =>
    Object.fromEntries(
      selectionValues.map((value) => [value, frontendHousehold.困りごと[value]])
    );

  return (
    <MultipleSelectionQuestion
      title="困りごとはありますか？"
      selections={selections}
      defaultSelections={defaultSelections}
    />
  );
};

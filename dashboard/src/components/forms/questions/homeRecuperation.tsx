import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import {
  currentDateAtom,
  frontendHouseholdAtom,
  householdAtom,
} from '../../../state';

export const HomeRecuperation = ({
  personName,
  updateNextQuestionKey,
}: {
  personName: string;
  updateNextQuestionKey: (frontendHousehold: any) => void;
}) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].在宅療養中 = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
    updateNextQuestionKey(frontendHousehold);
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].在宅療養中 = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
    updateNextQuestionKey(frontendHousehold);
  };

  return (
    <YesNoQuestion
      title="在宅療養中（結核、または治療に3か月以上かかるもの）ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

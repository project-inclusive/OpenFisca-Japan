import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const HIV = ({
  personName,
  yesUpdateNextQuestion,
  noUpdateNextQuestion,
}: {
  personName: string;
  yesUpdateNextQuestion: () => void;
  noUpdateNextQuestion: () => void;
}) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].HIV感染者である = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
    yesUpdateNextQuestion();
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].HIV感染者である = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
    noUpdateNextQuestion();
  };

  return (
    <YesNoQuestion
      title="HIVに感染していますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].HIV感染者である
          ? household.世帯員[personName].HIV感染者である[currentDate]
          : null
      }
    />
  );
};

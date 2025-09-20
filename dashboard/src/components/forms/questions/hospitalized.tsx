import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const Hospitalized = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].入院中 = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].入院中 = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="入院中ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].入院中
          ? household.世帯員[personName].入院中[currentDate]
          : null
      }
    />
  );
};

import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const DisasterDisabilityQuestion = ({
  personName,
}: {
  personName: string;
}) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].災害による重い後遺障害がある = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].災害による重い後遺障害がある = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="災害によって、精神または身体に重い障害がありますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].災害による重い後遺障害がある
          ? household.世帯員[personName].災害による重い後遺障害がある[
              currentDate
            ]
          : null
      }
    />
  );
};

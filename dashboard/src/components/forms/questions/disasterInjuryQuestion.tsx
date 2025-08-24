import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const DisasterInjuryQuestion = ({
  personName,
}: {
  personName: string;
}) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].災害による負傷の療養期間 = {
      [currentDate]: '一か月以上',
    };
    setHousehold({ ...newHousehold });
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].災害による負傷の療養期間 = {
      [currentDate]: '無',
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="災害により負傷し、1ヶ月以上療養を続けていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].災害による負傷の療養期間
          ? household.世帯員[personName].災害による負傷の療養期間[
              currentDate
            ] === '一か月以上'
          : null
      }
    />
  );
};

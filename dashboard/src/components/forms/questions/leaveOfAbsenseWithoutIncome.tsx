import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { YesNoQuestion } from '../templates/yesNoQuestion';

export const LeaveOfAbsenseWithoutIncome = ({
  personName,
}: {
  personName: string;
}) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].休業中に給与の支払いがない = {
      [currentDate]: true,
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].休業中に給与の支払いがない = {
      [currentDate]: false,
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="休業中に給与の支払いがない状態ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

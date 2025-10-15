import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const NursingHome = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].介護施設入所中 = {
      [currentDate]: true,
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].介護施設入所中 = {
      [currentDate]: false,
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="介護施設に入所していますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

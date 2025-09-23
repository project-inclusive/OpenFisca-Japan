import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const HouseholdGoodsDamageQuestion = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.家財の損害 = {
      [currentDate]: '三分の一以上',
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.家財の損害 = {
      [currentDate]: '無',
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="家財の３分の１以上の損害が発生しましたか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

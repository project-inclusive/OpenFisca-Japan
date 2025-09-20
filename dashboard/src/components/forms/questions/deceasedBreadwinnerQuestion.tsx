import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const DeceasedBreadwinnerQuestion = () => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.災害で生計維持者が死亡した = {
      [currentDate]: true,
    };
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.災害で生計維持者が死亡した = {
      [currentDate]: false,
    };
  };

  return (
    <YesNoQuestion
      title="災害で生計維持者が亡くなりましたか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

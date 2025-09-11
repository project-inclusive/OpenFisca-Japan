import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const FamilyHIVByBloodProduct = ({
  personName,
}: {
  personName: string;
}) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].家族に血液製剤によるHIV感染者がいる = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].家族に血液製剤によるHIV感染者がいる = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="家族に血液製剤によってHIVに感染した方はいますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

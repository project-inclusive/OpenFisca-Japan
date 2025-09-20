import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const HepatitisCByBloodProduct = ({
  personName,
}: {
  personName: string;
}) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[
      personName
    ].血液製剤の投与によってC型肝炎ウイルスに感染した = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[
      personName
    ].血液製剤の投与によってC型肝炎ウイルスに感染した = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="血液製剤の投与によってC型肝炎ウイルスに感染しましたか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName]
          .血液製剤の投与によってC型肝炎ウイルスに感染した
          ? household.世帯員[personName]
              .血液製剤の投与によってC型肝炎ウイルスに感染した[currentDate]
          : null
      }
    />
  );
};

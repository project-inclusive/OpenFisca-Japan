import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const Cirrhosis = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[
      personName
    ].肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
  };
  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[
      personName
    ].肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
      [currentDate]: false,
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName]
          .肝硬変や肝がんに罹患しているまたは肝移植をおこなった
          ? household.世帯員[personName]
              .肝硬変や肝がんに罹患しているまたは肝移植をおこなった[currentDate]
          : null
      }
    />
  );
};

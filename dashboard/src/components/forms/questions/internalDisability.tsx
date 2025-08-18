import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const InternalDisability = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].内部障害 = {
      [currentDate]: '有',
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].内部障害 = {
      [currentDate]: '無',
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="内部障害がありますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) => {
        if (household.世帯員[personName]?.内部障害 != null) {
          return household.世帯員[personName].内部障害[currentDate] === '有';
        }
        return null;
      }}
    />
  );
};
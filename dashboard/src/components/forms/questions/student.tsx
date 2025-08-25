import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const Student = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].学生 = {
      [currentDate]: true,
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].学生 = {
      [currentDate]: false,
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="高校、大学、専門学校、職業訓練学校等の学生ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) => {
        if (household.世帯員[personName]?.学生?.[currentDate] != null) {
          return household.世帯員[personName].学生[currentDate];
        }
        return null;
      }}
    />
  );
};

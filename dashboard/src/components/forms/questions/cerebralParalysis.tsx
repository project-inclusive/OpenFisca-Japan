import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const CerebralParalysis = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].脳性まひ_進行性筋萎縮症 = {
      [currentDate]: '有',
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].脳性まひ_進行性筋萎縮症 = {
      [currentDate]: '無',
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="脳性まひ、または進行性筋萎縮症ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) => {
        if (household.世帯員[personName]?.脳性まひ_進行性筋萎縮症?.[currentDate] != null) {
          return household.世帯員[personName].脳性まひ_進行性筋萎縮症[currentDate] === '有';
        }
        return null;
      }}
    />
  );
};
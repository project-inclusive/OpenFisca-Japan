import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AmountOfMoney } from '../templates/amountOfMoney';

export const Income = ({ personName }: { personName: string }) => {
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const onChangeAmount = (amount: number) => {
    const newHousehold = {
      ...household,
    };
    newHousehold.世帯員[personName].収入 = { [currentDate]: amount };
    setHousehold(newHousehold);
  };

  const defaultAmount = ({ household }: { household: any }) => {
    const income = household.世帯員[personName].収入;
    return income ? income[currentDate] : null;
  };

  return (
    <AmountOfMoney
      title={isDisasterCalculation ? '被災前の年収' : '年収'}
      personName={personName}
      onChangeAmount={onChangeAmount}
      defaultAmount={defaultAmount}
    />
  );
};

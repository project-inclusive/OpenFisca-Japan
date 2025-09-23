import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AmountOfMoney } from '../templates/amountOfMoney';

export const Deposit = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const onChangeAmount = (amount: number) => {
    const newHousehold = {
      ...household,
    };
    newHousehold.世帯員[personName].預貯金 = { [currentDate]: amount };
    setHousehold(newHousehold);
  };

  return (
    <AmountOfMoney
      title="預貯金"
      personName={personName}
      onChangeAmount={onChangeAmount}
    />
  );
};

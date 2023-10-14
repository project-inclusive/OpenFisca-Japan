import { KeyboardEvent, useCallback, useContext, useState } from 'react';
import { Box, HStack, Input, FormControl, FormLabel } from '@chakra-ui/react';

import { CurrentDateContext } from '../../../contexts/CurrentDateContext';
import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { ErrorMessage } from './validation/ErrorMessage';

export const Deposit = ({
  personName
}: {
  personName: string;
}) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);

  const [shownDeposit, setShownDeposit] = useState<string | number>('');

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = {
      ...household,
    };

    // 「万円」単位を「円」に換算
    let deposit = parseInt(event.currentTarget.value) * 10000;
    // 正の整数以外は0に変換
    if (isNaN(deposit) || deposit < 0) {
      deposit = 0;
      setShownDeposit('');
    } else {
      setShownDeposit(deposit / 10000);
    }
    
    newHousehold.世帯員[personName].預貯金 = { [currentDate]: deposit };
    setHousehold(newHousehold);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // 入力確定した際にページ遷移しないようにする
    if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      {<ErrorMessage condition={shownDeposit === ''} />}
      <FormControl>
        <FormLabel fontWeight="Regular">
          <HStack>
            <Box>預貯金</Box>
          </HStack>
        </FormLabel>

        <HStack mb={4}>
          <Input
            data-testid="income-input"
            type="number"
            value={shownDeposit}
            onChange={onChange}
            onKeyDown={onKeyDown}
            width="10em"
          />
          <Box>万円</Box>
        </HStack>
      </FormControl>
    </>
  );
}
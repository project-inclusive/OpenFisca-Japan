import { KeyboardEvent, useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, HStack, Input, FormControl, FormLabel } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const Deposit = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);

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

  // stored states set displayed value when page transition
  useEffect(() => {
    const storedDepositObj = household.世帯員[personName].預貯金;
    if (storedDepositObj) {
      setShownDeposit(storedDepositObj[currentDate] / 10000);
    }
  }, [navigationType]);

  return (
    <>
      <FormControl>
        <FormLabel fontWeight="Regular">
          <HStack>
            <Box>預貯金</Box>
          </HStack>
        </FormLabel>

        <HStack mb={4}>
          <Input
            data-testid="deposit-input"
            type="number"
            value={shownDeposit}
            pattern="[0-9]*"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ''
              );
            }}
            onChange={onChange}
            onKeyDown={onKeyDown}
            width="10em"
          />
          <Box>万円</Box>
        </HStack>
      </FormControl>
    </>
  );
};

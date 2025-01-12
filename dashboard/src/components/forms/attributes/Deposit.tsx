import { KeyboardEvent, useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, HStack, Input, FormControl, FormLabel } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

import { toHalf } from '../../../utils/toHalf';
import { isMobile } from 'react-device-detect';

export const Deposit = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);

  const [shownDeposit, setShownDeposit] = useState<string | number>('');

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = {
      ...household,
    };

    // 全角数字を半角数字に変換
    let value = toHalf(event.currentTarget.value);
    value = value.replace(/[^0-9]/g, '');

    // 「万円」単位を「円」に換算
    let deposit = parseInt(value) * 10000;
    const maxDeposit = 10000000000; // オーバーフローしないよう上限を100億に設定

    // 正の整数以外は0に変換
    if (isNaN(deposit) || deposit < 0) {
      deposit = 0;
      setShownDeposit('');
    } else if (deposit > maxDeposit) {
      deposit = maxDeposit;
      setShownDeposit(deposit / 10000);
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

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const value = Number(shownDeposit) + 1;
      setShownDeposit(value);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const value = Number(shownDeposit) - 1;
      setShownDeposit(Math.max(value, 0));
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
            type={isMobile ? 'number' : 'text'}
            value={shownDeposit}
            onChange={onChange}
            onKeyDown={onKeyDown}
            width="10em"
            {...(isMobile && { pattern: '[0-9]*' })}
          />
          <Box>万円</Box>
        </HStack>
      </FormControl>
    </>
  );
};

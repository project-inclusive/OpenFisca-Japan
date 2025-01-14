import { KeyboardEvent, useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, HStack, Input, FormControl, FormLabel } from '@chakra-ui/react';

import { ErrorMessage } from './validation/ErrorMessage';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';

export const Income = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [shownIncome, setShownIncome] = useState<string | number>('');

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        // 前回と同じ値を設定して終了
        // （設定しないままreturnすると未変換の全角入力が残ってしまいエンターキーを押すまで反映できなくなってしまう）
        setHousehold(household);
        return;
      }
    }

    const newHousehold = {
      ...household,
    };

    // 全角数字を半角数字に変換
    let value = toHalf(event.target.value);
    value = value.replace(/[^0-9]/g, '');
    const maxIncome = 10000000000; // オーバーフローしないよう上限を100億に設定

    // 「万円」単位を「円」に換算
    let income = parseInt(value) * 10000;
    // 正の整数以外は0に変換
    if (isNaN(income) || income < 0) {
      income = 0;
      setShownIncome('');
    } else if (income > maxIncome) {
      income = maxIncome;
      setShownIncome(income / 10000);
    } else {
      setShownIncome(income / 10000);
    }

    newHousehold.世帯員[personName].収入 = { [currentDate]: income };
    setHousehold(newHousehold);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // 入力確定した際にページ遷移しないようにする
    if (e.key == 'Enter') {
      e.preventDefault();
    }

    if (e.key === 'ArrowUp') {
      const value = Number(shownIncome) + 1;
      setShownIncome(value);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      let value = Number(shownIncome) - 1;
      if (value < 0) {
        value = 0;
      }
      setShownIncome(value);
    }
  };

  // stored states set displayed value when page transition
  useEffect(() => {
    const storedIncomeObj = household.世帯員[personName].収入;
    if (storedIncomeObj) {
      setShownIncome(storedIncomeObj[currentDate] / 10000);
    }
  }, [navigationType]);

  return (
    <>
      {mustInput && <ErrorMessage condition={shownIncome === ''} />}
      <FormControl>
        <FormLabel fontWeight="Regular">
          <HStack>
            <Box>{isDisasterCalculation && '被災前の'}年収</Box>
            {mustInput && (
              <Box color="red" fontSize="0.7em">
                必須
              </Box>
            )}
          </HStack>
        </FormLabel>

        <HStack mb={4}>
          <Input
            data-testid="income-input"
            type={isMobile ? 'number' : 'text'}
            value={shownIncome}
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

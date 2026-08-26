import { useState, useEffect, KeyboardEvent } from 'react';
import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Center,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../../forms/validation/ErrorMessage';
import { questionValidatedAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { AmountOfMoneyQuestion } from '../../../state/questionDefinition';

export const AmountOfMoneyQuestionTemplate = ({
  title,
  assignFunc,
  initialValue,
}: {
  title: string;
  assignFunc: (question: AmountOfMoneyQuestion) => void;
  initialValue?: AmountOfMoneyQuestion;
}) => {
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [amountState, setAmountState] = useState<number | undefined>(
    initialValue?.selection
  );

  useEffect(() => {
    setQuestionValidated(amountState != null);
  }, [amountState, title, initialValue]);

  const changeAmount = (amount: number | undefined) => {
    const maxAmount = 1000000; // オーバーフローしないよう上限を100億(100万 * 1万)に設定
    if (typeof amount === 'number' && (amount < 0 || amount > maxAmount)) {
      // 範囲外なので0にする
      setAmountState(0);
      assignFunc({ type: 'AmountOfMoney', selection: 0, unit: '万円' });
      return;
    }
    setAmountState(amount);
    assignFunc({ type: 'AmountOfMoney', selection: amount, unit: '万円' });
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string = toHalf(event.currentTarget.value) ?? '';
    value = value.replace(/[^0-9]/g, '');

    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        // 前回と同じ値を設定して終了
        // （設定しないままreturnすると未変換の全角入力が残ってしまいエンターキーを押すまで反映できなくなってしまう）
        changeAmount(amountState);
        return;
      }
    }

    // If empty string, delete age
    if (value === '') {
      setAmountState(undefined);
      return;
    }

    changeAmount(Number(value));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // 入力確定した際にページ遷移しないようにする
    if (e.key == 'Enter') {
      e.preventDefault();
    }

    if (e.key === 'ArrowUp') {
      const amount = Number.isNaN(Number(amountState))
        ? 0
        : Number(amountState);
      const value = amount + 1;
      changeAmount(value);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const amount = Number.isNaN(Number(amountState))
        ? 0
        : Number(amountState);
      let value = amount - 1;
      if (value < 0) {
        value = 0;
      }
      changeAmount(value);
    }
  };

  return (
    <VStack flex={1}>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.subTitleFontSize}>
          <Center>
            <HStack>
              <Box textAlign="center">{title}</Box>
            </HStack>
          </Center>
        </FormLabel>

        <Center>
          <HStack mt={8} mb={8}>
            <Input
              height="3.5em"
              textAlign="right"
              data-testid="amount-input"
              type={isMobile ? 'number' : 'text'}
              value={amountState ?? ''}
              onChange={handleAmountChange}
              onKeyDown={onKeyDown}
              width="80%"
              fontSize={configData.style.itemFontSize}
              {...(isMobile && { pattern: '[0-9]*' })}
            />
            <Box>万円</Box>
          </HStack>
        </Center>
      </FormControl>
    </VStack>
  );
};

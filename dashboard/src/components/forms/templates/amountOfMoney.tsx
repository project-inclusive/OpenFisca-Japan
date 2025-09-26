import { useState, useEffect, KeyboardEvent, useCallback } from 'react';
import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Center,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../validation/ErrorMessage';
import {
  frontendHouseholdAtom,
  householdAtom,
  questionKeyAtom,
  questionValidatedAtom,
} from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';

export const AmountOfMoney = ({
  title,
  personName,
  onChangeAmount,
}: {
  title: string;
  personName: string;
  onChangeAmount: (amount: number) => void;
}) => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );
  const [shownAmount, setShownAmount] = useState<string | number>(
    frontendHousehold.世帯員[personName][questionKey.title] ?? ''
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

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

    // 全角数字を半角数字に変換
    let value = toHalf(event.target.value);
    value = value.replace(/[^0-9]/g, '');
    const maxAmount = 10000000000; // オーバーフローしないよう上限を100億に設定

    // 「万円」単位を「円」に換算
    let amount = parseInt(value) * 10000;
    // 正の整数以外は0に変換
    if (isNaN(amount) || amount < 0) {
      amount = 0;
      setShownAmount('');
      setQuestionValidated(false);
    } else if (amount > maxAmount) {
      amount = maxAmount;
      setShownAmount(amount / 10000);
      setQuestionValidated(true);
    } else {
      setShownAmount(amount / 10000);
      setQuestionValidated(true);
    }

    onChangeAmount(amount);

    // 別ページから戻ってきたときのために選択肢を記録
    const newFrontendHousehold = { ...frontendHousehold };
    newFrontendHousehold.世帯員[personName][questionKey.title] = amount / 10000;
    setFrontendHousehold(newFrontendHousehold);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // 入力確定した際にページ遷移しないようにする
    if (e.key == 'Enter') {
      e.preventDefault();
    }

    if (e.key === 'ArrowUp') {
      const value = Number(shownAmount) + 1;
      setShownAmount(value);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      let value = Number(shownAmount) - 1;
      if (value < 0) {
        value = 0;
      }
      setShownAmount(value);
    }
  };

  // stored states set displayed value when page transition
  useEffect(() => {
    const storedShownIncomeObj =
      frontendHousehold.世帯員[personName][questionKey.title];
    if (storedShownIncomeObj) {
      setShownAmount(storedShownIncomeObj);
      onChangeAmount((shownAmount as number) * 10000);
      setQuestionValidated(true);
    }
  }, [personName]);

  return (
    <>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.itemFontSize}>
          <Center>
            <HStack>
              <Box>{title}</Box>
            </HStack>
          </Center>
        </FormLabel>

        <HStack mb={4}>
          <Input
            data-testid="amount-input"
            type={isMobile ? 'number' : 'text'}
            value={shownAmount}
            onChange={onChange}
            onKeyDown={onKeyDown}
            width="10em"
            fontSize={configData.style.itemFontSize}
            {...(isMobile && { pattern: '[0-9]*' })}
          />
          <Box>万円</Box>
        </HStack>
      </FormControl>
    </>
  );
};

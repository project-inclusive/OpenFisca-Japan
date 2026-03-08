import { useState, useEffect } from 'react';
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
import { AgeQuestion } from '../../../state/questionDefinition';

export const AgeQuestionTemplate = ({
  assignFunc,
  initialValue,
}: {
  assignFunc: (question: AgeQuestion) => void;
  initialValue: AgeQuestion;
}) => {
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [ageState, setAgeState] = useState<number | undefined>(
    initialValue.selection
  );

  useEffect(() => {
    setQuestionValidated(ageState != null);
  }, [ageState]);

  const changeAge = (age: number | undefined) => {
    if (typeof age === 'number' && age < 0) {
      // 範囲外なので0にする
      setAgeState(0);
      assignFunc({ type: 'Age', selection: 0 });
      return;
    }
    setAgeState(age);
    assignFunc({ type: 'Age', selection: age });
  };

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        changeAge(ageState);
        return;
      }
    }

    // If empty string, delete age
    if (value === '') {
      setAgeState(undefined);
      return;
    }

    const numValue = Number(value);
    const inputAge = numValue < 0 || numValue > 200 ? 200 : numValue; // 0~200歳に入力を制限(年齢が高すぎて誕生年が3桁になるとパース処理が煩雑なため)
    changeAge(inputAge);
  };

  return (
    <VStack flex={1}>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.subTitleFontSize}>
          <Center>
            <Box textAlign="center">年齢</Box>
          </Center>
        </FormLabel>

        <Center>
          <HStack mt={8} mb={8}>
            <Input
              width="100%"
              height="3.5em"
              textAlign="right"
              fontSize={configData.style.itemFontSize}
              type={isMobile ? 'number' : 'text'}
              value={ageState ?? ''}
              onChange={handleAgeChange}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  changeAge(ageState ? ageState + 1 : 1);
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const newAge = ageState ? Math.max(ageState - 1, 0) : 0;
                    changeAge(Number(newAge === 0 ? '' : newAge));
                  }
                }
              }}
              {...(isMobile && { pattern: '[0-9]*' })}
            />
            <Box>歳</Box>
          </HStack>
        </Center>
      </FormControl>
    </VStack>
  );
};

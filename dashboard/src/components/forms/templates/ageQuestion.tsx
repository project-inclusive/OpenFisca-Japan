import { useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Center,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../attributes/validation/ErrorMessage';
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

export const AgeQuestion = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const questionKey = useRecoilValue(questionKeyAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );
  const [age, setAge] = useState<string | number>(
    frontendHousehold.世帯員[personName][questionKey.title] ?? ''
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  function changeAge(age: number) {
    setAge(age);

    if (typeof age === 'number' && age >= 0) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const birthYear = currentYear - age;
      const newHousehold = {
        ...household,
      };
      newHousehold.世帯員[personName].誕生年月日 = {
        ETERNITY: `${birthYear.toString()}-01-01`,
      };
      setHousehold(newHousehold);

      // 別ページから戻ってきたときのために選択肢を記録
      const newFrontendHousehold = { ...frontendHousehold };
      newFrontendHousehold.世帯員[personName][questionKey.title] = age;
      setFrontendHousehold(newFrontendHousehold);
    }
  }

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
        changeAge(Number(age));
        setQuestionValidated(true);
        return;
      }
    }

    // If empty string, set as is
    if (value === '') {
      setAge('');
      setQuestionValidated(false);
      return;
    }

    const numValue = Number(value);
    const inputAge = numValue < 0 || numValue > 200 ? '' : numValue; // 0~200歳に入力を制限(年齢が高すぎて誕生年が3桁になるとパース処理が煩雑なため)
    changeAge(Number(inputAge));
    setQuestionValidated(true);
  };

  // stored states set displayed age when page transition
  useEffect(() => {
    if (age !== '') {
      changeAge(Number(age));
      setQuestionValidated(true);
    }
  }, [navigationType, age]);

  return (
    <>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.itemFontSize}>
          <Center>
            <Box>年齢</Box>
          </Center>
        </FormLabel>

        <HStack mb={4}>
          <Input
            width="6em"
            fontSize={configData.style.itemFontSize}
            type={isMobile ? 'number' : 'text'}
            value={age}
            onChange={handleAgeChange}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                changeAge(Number(age) + 1);
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  const newAge = Math.max(Number(age) - 1, 0);
                  changeAge(Number(newAge === 0 ? '' : newAge));
                }
              }
            }}
            {...(isMobile && { pattern: '[0-9]*' })}
          />
          <Box>歳</Box>
        </HStack>
      </FormControl>
    </>
  );
};

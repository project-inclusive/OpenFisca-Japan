import { useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, HStack, FormControl, FormLabel, Input } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../attributes/validation/ErrorMessage';
import { householdAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { Question } from '../question';

// TODO: タイトルやonClickを引数で変更可能にする
export const AgeQuestion = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [age, setAge] = useState<string | number>('');

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
        return;
      }
    }

    // If empty string, set as is
    if (value === '') {
      setAge('');
      return;
    }

    const numValue = Number(value);
    const inputAge = numValue < 0 || numValue > 200 ? '' : numValue; // 0~200歳に入力を制限(年齢が高すぎて誕生年が3桁になるとパース処理が煩雑なため)
    changeAge(Number(inputAge));
  };

  // stored states set displayed age when page transition
  useEffect(() => {
    const birthdayObj = household.世帯員[personName].誕生年月日;
    if (birthdayObj && birthdayObj.ETERNITY) {
      const birthYear = Number(birthdayObj.ETERNITY.substring(0, 4));
      const birthMonth = Number(birthdayObj.ETERNITY.substring(5, 7));
      const birthDate = Number(birthdayObj.ETERNITY.substring(8));
      const birthSum = 10000 * birthYear + 100 * birthMonth + birthDate;
      const today = new Date();
      const todaySum =
        10000 * today.getFullYear() +
        100 * (today.getMonth() + 1) +
        today.getDate();
      setAge(Math.floor((todaySum - birthSum) / 10000));
    }
  }, [navigationType, household.世帯員[personName]?.誕生年月日]);

  return (
    <Question>
      <>
        {mustInput && <ErrorMessage condition={age === ''} />}

        <FormControl>
          <FormLabel fontSize={configData.style.itemFontSize}>
            <HStack>
              <Box>年齢</Box>
              {mustInput && (
                <Box color="red" fontSize="0.7em">
                  必須
                </Box>
              )}
            </HStack>
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
    </Question>
  );
};

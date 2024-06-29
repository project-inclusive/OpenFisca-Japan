import { useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, HStack, FormControl, FormLabel, Input } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from './validation/ErrorMessage';
import { householdAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import { isMobile } from 'react-device-detect';

export const AgeInput = ({
  personName,
  mustInput,
  you = false,
}: {
  personName: string;
  mustInput: boolean;
  you?: boolean;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [age, setAge] = useState<string | number>('');

  function changeAge(age: number) {
    setAge(age);

    if (age) {
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
      //console.log('[DEBUG] household -> ', newHousehold);
    }
  }

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: number | string = toHalf(event.currentTarget.value) ?? 0;
    value = value.replace(/[^0-9]/g, '');
    value = Number(value);

    const inputAge = value <= 0 ? '' : value;
    changeAge(Number(inputAge));
  };

  // stored states set displayed age when page transition
  useEffect(() => {
    const birthdayObj = household.世帯員[personName].誕生年月日;
    if (birthdayObj && birthdayObj.ETERNITY) {
      const birthYear = parseInt(birthdayObj.ETERNITY.substring(0, 4));
      const birthMonth = parseInt(birthdayObj.ETERNITY.substring(5, 7));
      const birthDate = parseInt(birthdayObj.ETERNITY.substring(8));
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
    <>
      {/* Child Time Error */}
      {mustInput && !you && <ErrorMessage condition={age === ''} />}

      {/* Error for the person's own time */}
      {mustInput && you && <ErrorMessage condition={age === 0} />}
      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
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

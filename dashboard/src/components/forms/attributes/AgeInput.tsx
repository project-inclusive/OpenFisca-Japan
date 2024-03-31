import { useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, HStack, FormControl, FormLabel, Input } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from './validation/ErrorMessage';
import { householdAtom } from '../../../state';
import { useRecoilState } from 'recoil';

export const AgeInput = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [age, setAge] = useState('');

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    parseInt(event.currentTarget.value) < 0
      ? setAge('0')
      : setAge(event.currentTarget.value);

  useEffect(() => {
    if (age) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const birthYear = currentYear - parseInt(age);
      const newHousehold = {
        ...household,
      };
      newHousehold.世帯員[personName].誕生年月日 = {
        ETERNITY: `${birthYear.toString()}-01-01`,
      };
      setHousehold(newHousehold);
    }
  }, [age]);

  // stored states set displayed age when page transition
  useEffect(() => {
    const birthdayObj = household.世帯員[personName].誕生年月日;
    if (birthdayObj && birthdayObj.ETERNITY) {
      const birthYear = parseInt(birthdayObj.ETERNITY.substring(0, 4));
      const today = new Date();
      const currentYear = today.getFullYear();
      setAge(String(currentYear - birthYear));
    }
  }, [navigationType, household.世帯員[personName]?.誕生年月日]);

  return (
    <>
      {mustInput && <ErrorMessage condition={!age} />}
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
            type="number"
            value={age}
            pattern="[0-9]*"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ''
              );
            }}
            onChange={handleAgeChange}
          />
          <Box>歳</Box>
        </HStack>
      </FormControl>
    </>
  );
};

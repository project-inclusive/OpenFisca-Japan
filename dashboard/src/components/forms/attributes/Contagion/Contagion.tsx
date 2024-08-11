// Hepatitis C（C型肝炎）

import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../state';

import { HIV } from './HIV/HIV';
import { HepatitisC } from './HepatitisC/HepatitisC';

export const Contagion = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].感染症歴 = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].感染症歴 = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    setIsChecked(personObj.感染症歴 && personObj.感染症歴[currentDate]);
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        感染症
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <HIV personName={personName} />
            <HepatitisC personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

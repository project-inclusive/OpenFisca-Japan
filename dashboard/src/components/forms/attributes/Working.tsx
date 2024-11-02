import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { NewJob } from './NewJob';
import { LeaveOfAbsense } from './LeaveOfAbsense';
import { Occupation } from './Occupation';

export const Working = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].六か月以内に新規就労 = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].就労形態 = {
        [currentDate]: '無',
      };
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  // stored states set value when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    if (
      (personObj.六か月以内に新規就労 &&
        personObj.六か月以内に新規就労[currentDate] !== false) ||
      (personObj.就労形態 && personObj.就労形態[currentDate] !== '無')
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        仕事をしている
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <NewJob personName={personName} />
            <LeaveOfAbsense personName={personName} />
            <Occupation personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

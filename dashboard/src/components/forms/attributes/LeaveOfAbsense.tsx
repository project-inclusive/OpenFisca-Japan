import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { LeaveOfAbsenseWithoutSalary } from './LeaveOfAbsenseWithoutSalary';

export const LeaveOfAbsense = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].休業中に給与の支払いがない = {
        [currentDate]: false,
      };
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  // stored states set value when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    if (
      personObj.休業中に給与の支払いがない &&
      personObj.休業中に給与の支払いがない[currentDate] !== false
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        休業中である
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <LeaveOfAbsenseWithoutSalary personName={personName} />
        </Box>
      )}
    </Box>
  );
};

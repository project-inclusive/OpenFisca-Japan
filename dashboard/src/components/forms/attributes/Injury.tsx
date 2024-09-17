import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { LeaveOfAbsenseByInjury } from './LeaveOfAbsenseByInjury';
import { IndustrialAccidentInjury } from './IndustrialAccidentInjury';

export const Injury = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].けがによって連続三日以上休業している = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].業務によってけがをした = {
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
      (personObj.けがによって連続三日以上休業している &&
        personObj.けがによって連続三日以上休業している[currentDate] !==
          false) ||
      (personObj.業務によってけがをした &&
        personObj.業務によってけがをした[currentDate] !== false)
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        けがをしている
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <LeaveOfAbsenseByInjury personName={personName} />
            <IndustrialAccidentInjury personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const LeaveOfAbsenseWithoutSalary = ({
  personName,
}: {
  personName: string;
}) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].休業中に給与の支払いがない = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].休業中に給与の支払いがない = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const LeaveOfAbsenseWithoutSalaryObj =
      household.世帯員[personName].休業中に給与の支払いがない;
    setIsChecked(
      LeaveOfAbsenseWithoutSalaryObj &&
        LeaveOfAbsenseWithoutSalaryObj[currentDate]
    );
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        休業中に給与の支払いがない
      </Checkbox>
      <br />
    </>
  );
};

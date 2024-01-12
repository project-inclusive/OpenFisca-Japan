import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const Student = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].学生 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].学生 = { [currentDate]: false };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const studentObj = household.世帯員[personName].学生;
    setIsChecked(studentObj && studentObj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onChange}
        mb={4}
      >
        小・中・高校、大学、専門学校、職業訓練学校等の学生である
      </Checkbox>
      <br></br>
    </>
  );
};

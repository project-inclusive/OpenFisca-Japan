import { useState, useCallback, useContext } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { useRecoilValue } from 'recoil';
import { currentDateAtom } from '../../../state';

export const Student = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);

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

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        checked={isChecked}
        onChange={onChange}
        mb={4}
      >
        小・中・高校、大学、専門学校、職業訓練学校等の学生である
      </Checkbox>
      <br></br>
    </>
  );
};

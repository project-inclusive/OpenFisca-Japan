import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const NewJob = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].六か月以内に新規就労 = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].六か月以内に新規就労 = {
        [currentDate]: false,
      };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const NewJobObj = household.世帯員[personName].六か月以内に新規就労;
    setIsChecked(NewJobObj && NewJobObj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onChange}
        mb={4}
      >
        6か月以内に新しい仕事を始めた
      </Checkbox>
      <br></br>
    </>
  );
};

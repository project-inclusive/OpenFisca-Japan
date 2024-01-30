import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';
import { useRecoilValue, useRecoilState } from 'recoil';

import { currentDateAtom, householdAtom } from '../../../state';

export const HouseholdGoodsDamage = () => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯一覧.世帯1.家財の損害 = {
        [currentDate]: '三分の一以上',
      };
    } else {
      newHousehold.世帯一覧.世帯1.家財の損害 = {
        [currentDate]: '無',
      };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set displayed value when page transition
  useEffect(() => {
    const householdObj = household.世帯一覧.世帯1.家財の損害;
    setIsChecked(householdObj && householdObj[currentDate] === '三分の一以上');
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        家財の３分の１以上に損害がある
      </Checkbox>
    </Box>
  );
};

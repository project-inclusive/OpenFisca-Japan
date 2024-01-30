import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';
import { useRecoilValue, useRecoilState } from 'recoil';

import { currentDateAtom, householdAtom } from '../../../state';

export const DisasterInjuryPeriod = ({
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
      newHousehold.世帯員[personName].災害による負傷の療養期間 = {
        [currentDate]: '一か月以上',
      };
    } else {
      newHousehold.世帯員[personName].災害による負傷の療養期間 = {
        [currentDate]: '無',
      };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set displayed value when page transition
  useEffect(() => {
    const memberObj = household.世帯員[personName].災害による負傷の療養期間;
    setIsChecked(memberObj && memberObj[currentDate] === '一か月以上');
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        災害による負傷の療養期間が1ヶ月以上
      </Checkbox>
    </Box>
  );
};

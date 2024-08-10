// 第V因子（不安定因子）欠乏症

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const Factor5 = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].第V因子欠乏症 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].第V因子欠乏症 = { [currentDate]: false };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const factor5Obj = household.世帯員[personName].第V因子欠乏症;
    setIsChecked(factor5Obj && factor5Obj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        第V因子（不安定因子）欠乏症
      </Checkbox>
      <br />
    </>
  );
};

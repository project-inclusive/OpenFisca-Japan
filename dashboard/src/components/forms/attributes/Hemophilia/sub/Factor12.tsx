// 第XII因子（ヘイグマン因子）欠乏症

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const Factor12 = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].第XII因子欠乏症 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].第XII因子欠乏症 = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const factor12Obj = household.世帯員[personName].第XII因子欠乏症;
    setIsChecked(factor12Obj && factor12Obj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        第XII因子（ヘイグマン因子）欠乏症
      </Checkbox>
      <br />
    </>
  );
};

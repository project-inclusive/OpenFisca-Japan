// 第IX因子欠乏症（血友病B）

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const Factor9 = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].血液凝固因子異常症_第IX因子欠乏症 = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].血液凝固因子異常症_第IX因子欠乏症 = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const factor9Obj =
      household.世帯員[personName].血液凝固因子異常症_第IX因子欠乏症;
    setIsChecked(factor9Obj && factor9Obj[currentDate] === true);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        第IX因子欠乏症（血友病B）
      </Checkbox>
      <br />
    </>
  );
};

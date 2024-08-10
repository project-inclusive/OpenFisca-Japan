// Has a family member infected with HIV due to blood products

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const HasFamily = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].家族に血液製剤によるHIV感染者がいる = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].家族に血液製剤によるHIV感染者がいる = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const hasFamilyObj =
      household.世帯員[personName].家族に血液製剤によるHIV感染者がいる;
    setIsChecked(hasFamilyObj && hasFamilyObj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        家族に血液製剤によるHIV感染者がいる
      </Checkbox>
      <br />
    </>
  );
};

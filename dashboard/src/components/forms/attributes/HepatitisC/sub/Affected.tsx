// 肝硬変や肝がんに罹患しているまたは肝移植をおこなった

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const Affected = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[
        personName
      ].肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[
        personName
      ].肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const affectedObj =
      household.世帯員[personName]
        .肝硬変や肝がんに罹患しているまたは肝移植をおこなった;
    setIsChecked(affectedObj && affectedObj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        肝硬変や肝がんに罹患しているまたは肝移植をおこなった
      </Checkbox>
      <br />
    </>
  );
};

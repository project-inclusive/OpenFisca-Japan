// Infected with HIV due to blood product administration

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const DueToBloodPrd = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].血液製剤の投与によってHIVに感染した = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].血液製剤の投与によってHIVに感染した = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const dueToBloodObj =
      household.世帯員[personName].血液製剤の投与によってHIVに感染した;
    setIsChecked(dueToBloodObj && dueToBloodObj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        血液製剤の投与によってHIVに感染した
      </Checkbox>
      <br />
    </>
  );
};

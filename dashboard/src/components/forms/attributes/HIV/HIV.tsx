// Hemophilia（血友病）

import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';

import { AIDS } from './sub/AIDS';
import { HasFamily } from './sub/HasFamily';
import { DueToBloodPrd } from './sub/DueToBloodPrd';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../state';

export const HIV = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [isChecked, setIsChecked] = useState(false);
  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].血液製剤の投与によってHIVに感染した = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].家族に血液製剤によるHIV感染者がいる = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].エイズを発症している = {
        [currentDate]: false,
      };
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  // stored states set value when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    if (
      (personObj.血液製剤の投与によってHIVに感染した &&
        personObj.血液製剤の投与によってHIVに感染した[currentDate] !== false) ||
      (personObj.家族に血液製剤によるHIV感染者がいる &&
        personObj.家族に血液製剤によるHIV感染者がいる[currentDate] !== false) ||
      (personObj.エイズを発症している &&
        personObj.エイズを発症している[currentDate] !== false)
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        HIVに感染している
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <AIDS personName={personName} />
            <HasFamily personName={personName} />
            <DueToBloodPrd personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

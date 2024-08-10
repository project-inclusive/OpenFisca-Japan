// Hepatitis C（C型肝炎）

import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';

import { BloodProduct } from './sub/BloodProduct';
import { Affected } from './sub/Affected';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../state';

export const HepatitisC = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [isChecked, setIsChecked] = useState(false);
  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[
        personName
      ].血液製剤の投与によってC型肝炎ウイルスに感染した = {
        [currentDate]: false,
      };
      newHousehold.世帯員[
        personName
      ].肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
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
      (personObj.血液製剤の投与によってC型肝炎ウイルスに感染した &&
        personObj.血液製剤の投与によってC型肝炎ウイルスに感染した[
          currentDate
        ] !== false) ||
      (personObj.肝硬変や肝がんに罹患しているまたは肝移植をおこなった &&
        personObj.肝硬変や肝がんに罹患しているまたは肝移植をおこなった[
          currentDate
        ] !== false)
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        C型肝炎ウイルスに感染している
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <BloodProduct personName={personName} />
            <Affected personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

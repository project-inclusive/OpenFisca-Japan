import { useCallback, useState } from 'react';
import { Checkbox, Box } from '@chakra-ui/react';

import { HomeRecuperation } from './HomeRecuperation';
import { Hospitalized } from './Hospitalized';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const Recuperation = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);

  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].在宅療養中 = { [currentDate]: false };
      newHousehold.世帯員[personName].入院中 = { [currentDate]: false };
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onChange}>
        病気がある
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <HomeRecuperation personName={personName} />
            <Hospitalized personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

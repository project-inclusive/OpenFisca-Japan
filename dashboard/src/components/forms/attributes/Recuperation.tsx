import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box, Text } from '@chakra-ui/react';

import { HomeRecuperation } from './HomeRecuperation';
import { Hospitalized } from './Hospitalized';
import { Hemophilia } from './Hemophilia/Hemophilia';
import { Contagion } from './Contagion/Contagion';
import { RenalFailure } from './RenalFailure/RenalFailure';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { LeaveOfAbsenseByDisease } from './LeaveOfAbsenseByDisease';
import { IndustrialAccidentDisease } from './IndustrialAccidentDisease';

export const Recuperation = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].在宅療養中 = { [currentDate]: false };
      newHousehold.世帯員[personName].入院中 = { [currentDate]: false };
      newHousehold.世帯員[personName].感染症歴 = { [currentDate]: false };
      newHousehold.世帯員[personName].病気によって連続三日以上休業している = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].業務によって病気になった = {
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
      (personObj.在宅療養中 && personObj.在宅療養中[currentDate] !== false) ||
      (personObj.入院中 && personObj.入院中[currentDate] !== false) ||
      (personObj.感染症歴 && personObj.感染症歴[currentDate] !== false) ||
      (personObj.病気によって連続三日以上休業している &&
        personObj.病気によって連続三日以上休業している[currentDate] !==
          false) ||
      (personObj.業務によって病気になった &&
        personObj.業務によって病気になった[currentDate] !== false)
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        病気がある（または経過観察中）
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <HomeRecuperation personName={personName} />
            <Hospitalized personName={personName} />
            <LeaveOfAbsenseByDisease personName={personName} />
            <IndustrialAccidentDisease personName={personName} />
            <Text my={4}>病気の種類</Text>
            <Contagion personName={personName} />
            <Hemophilia personName={personName} />
            <RenalFailure personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

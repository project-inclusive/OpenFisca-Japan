import { useLocation } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import { householdAtom } from '../../state';

import configData from '../../config/app_config.json';
import { Income } from './attributes/Income';
import { Disability } from './attributes/Disability';
import { Student } from './attributes/Student';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';
import { Deposit } from './attributes/Deposit';
import { SpouseExistsButSingleParent } from './attributes/SpouseExistsButSingleParent';
import { DisasterDisability } from './attributes/DisasterDisability';
import { DisasterInjuryPeriod } from './attributes/DisasterInjuryPeriod';
import { AgeInput } from './attributes/AgeInput';

export const FormSpouse = () => {
  const location = useLocation();
  const isDetailedCalculation = location.pathname === '/calculate';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const household = useRecoilValue(householdAtom);

  const spouseName = '配偶者';

  return (
    <>
      {household.世帯一覧.世帯1.親一覧.length === 2 && (
        <>
          <Box bg="white" borderRadius="xl" p={4} m={4}>
            <Center
              fontSize={configData.style.subTitleFontSize}
              fontWeight="medium"
              mb="0.5em"
            >
              {isDisasterCalculation && '存命の'}
              {configData.calculationForm.spouseDescription}
            </Center>

            {isDetailedCalculation && (
              <AgeInput personName={spouseName} mustInput={true} />
            )}
            <Income personName={spouseName} mustInput={true} />

            {isDisasterCalculation && (
              <DisasterInjuryPeriod personName={spouseName} />
            )}
            {isDisasterCalculation && (
              <DisasterDisability personName={spouseName} />
            )}

            {isDetailedCalculation && <Deposit personName={spouseName} />}
            {isDetailedCalculation && <Student personName={spouseName} />}
            {isDetailedCalculation && <Working personName={spouseName} />}
            {isDetailedCalculation && <Disability personName={spouseName} />}
            {isDetailedCalculation && <Recuperation personName={spouseName} />}
            {isDetailedCalculation && <NursingHome personName={spouseName} />}
            {isDetailedCalculation && (
              <SpouseExistsButSingleParent personName={spouseName} />
            )}
          </Box>
        </>
      )}
    </>
  );
};

import { useLocation } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';

import configData from '../../config/app_config.json';
import { Birthday } from './attributes/Birthday';
import { Income } from './attributes/Income';
import { Disability } from './attributes/Disability';
import { Student } from './attributes/Student';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';
import { Deposit } from './attributes/Deposit';
import { SpouseExistsButSingleParent } from './attributes/SpouseExistsButSingleParent';
import { useRecoilState } from 'recoil';
import { householdAtom } from '../../state';

export const FormSpouse = () => {
  const location = useLocation();
  const isDetailedCalculation = location.pathname === '/calculate';
  const [household, setHousehold] = useRecoilState(householdAtom);

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
              {configData.calculationForm.spouseDescription}
            </Center>

            {isDetailedCalculation && (
              <Birthday personName={spouseName} mustInput={true} />
            )}
            <Income personName={spouseName} mustInput={true} />
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

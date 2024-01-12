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
  const isSimpleCalculation = location.pathname === '/calculate-simple';
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

            {!isSimpleCalculation && (
              <Birthday personName={spouseName} mustInput={true} />
            )}
            <Income personName={spouseName} mustInput={true} />
            {!isSimpleCalculation && <Deposit personName={spouseName} />}
            {!isSimpleCalculation && <Student personName={spouseName} />}
            {!isSimpleCalculation && <Working personName={spouseName} />}
            {!isSimpleCalculation && <Disability personName={spouseName} />}
            {!isSimpleCalculation && <Recuperation personName={spouseName} />}
            {!isSimpleCalculation && <NursingHome personName={spouseName} />}
            {!isSimpleCalculation && (
              <SpouseExistsButSingleParent personName={spouseName} />
            )}
          </Box>
        </>
      )}
    </>
  );
};

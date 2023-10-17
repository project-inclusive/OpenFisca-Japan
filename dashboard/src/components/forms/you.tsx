import { Box, Center } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import configData from '../../config/app_config.json';
import { PrefectureMunicipality } from './attributes/PrefectureMunicipality';
import { Birthday } from './attributes/Birthday';
import { Student } from './attributes/Student';
import { ChildrenNum } from './attributes/ChildrenNum';
import { ParentsNum } from './attributes/ParentsNum';
import { SpouseExists } from './attributes/SpouseExists';
import { Income } from './attributes/Income';
import { Disability } from './attributes/Disability';
import { RentingHouse } from './attributes/RentingHouse';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';
import { Pregnant } from './attributes/Pregnant';
import { Deposit } from './attributes/Deposit';

export const FormYou = () => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === '/calculate-simple';

  const yourName = 'あなた';
  return (
    <>
      <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
        <Center
          fontSize={configData.style.subTitleFontSize}
          fontWeight="medium"
          mb={2}
        >
          {configData.calculationForm.youDescription}
        </Center>
        <PrefectureMunicipality mustInput={true} />
        {!isSimpleCalculation && (
          <Birthday personName={yourName} mustInput={true} />
        )}
        <Income personName={yourName} mustInput={true} />
        {!isSimpleCalculation && <Deposit personName={yourName} />}
        {!isSimpleCalculation && <Student personName={yourName} />}
        {!isSimpleCalculation && <Working personName={yourName} />}
        {!isSimpleCalculation && <Disability personName={yourName} />}
        {!isSimpleCalculation && <Recuperation personName={yourName} />}
        {!isSimpleCalculation && <NursingHome personName={yourName} />}
        <SpouseExists />
        <ChildrenNum />
        {!isSimpleCalculation && <ParentsNum />}
        {!isSimpleCalculation && <Pregnant personName={yourName} />}
        {!isSimpleCalculation && <RentingHouse />}
      </Box>
    </>
  );
};

import { useContext } from 'react';
import { Box, Center } from '@chakra-ui/react';

import configData from '../../config/app_config.json';
import { HouseholdContext } from '../../contexts/HouseholdContext';
import { Birthday } from './attributes/Birthday';
import { Disability } from './attributes/Disability';
import { Income } from './attributes/Income';
import { Student } from './attributes/Student';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';

export const FormParents = () => {
  const { household } = useContext(HouseholdContext);
  return (
    <>
      {household.世帯.世帯1.親一覧 &&
        household.世帯.世帯1.親一覧.map((parentName: string, index: number) => (
          <div key={index}>
            <Box bg="white" borderRadius="xl" p={4} m={4}>
              <Center fontSize={configData.style.subTitleFontSize} fontWeight="medium" mb="0.5em">
                {configData.calculationForm.parentDescription}
                {`（${index + 1}人目）`}
              </Center>
              <Birthday personName={parentName} mustInput={true} />
              <Income personName={parentName} mustInput={true} />
              <Student personName={parentName} />
              <Working personName={parentName} />
              <Disability personName={parentName} />
              <Recuperation personName={parentName} />
              <NursingHome personName={parentName} />
            </Box>
          </div>
        ))}
    </>
  );
};

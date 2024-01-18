import { useLocation } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import { householdAtom } from '../../state';

import configData from '../../config/app_config.json';
import { Birthday } from './attributes/Birthday';
import { Disability } from './attributes/Disability';
import { AgeInput } from './attributes/AgeInput';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';
import { HighSchool } from './attributes/HighSchool';
import { DisasterDisability } from './attributes/DisasterDisability';

export const FormChildren = () => {
  const location = useLocation();
  const isDetailedCalculation = location.pathname === '/calculate';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';

  const household = useRecoilValue(householdAtom);

  return (
    <>
      {household.世帯一覧.世帯1.子一覧 &&
        household.世帯一覧.世帯1.子一覧.map(
          (childName: string, index: number) => (
            <div key={index}>
              <Box bg="white" borderRadius="xl" p={4} m={4}>
                <Center
                  fontSize={configData.style.subTitleFontSize}
                  fontWeight="medium"
                  mb="0.5em"
                >
                  {index + 1}
                  {configData.calculationForm.childrenDescription}
                </Center>

                {isDetailedCalculation ? (
                  <Birthday personName={childName} mustInput={true} />
                ) : (
                  <AgeInput personName={childName} mustInput />
                )}
                {isDetailedCalculation && <HighSchool personName={childName} />}
                {isDetailedCalculation && <Working personName={childName} />}
                {isDetailedCalculation && <Disability personName={childName} />}
                {isDetailedCalculation && (
                  <Recuperation personName={childName} />
                )}
                {isDetailedCalculation && (
                  <NursingHome personName={childName} />
                )}

                {isDisasterCalculation && (
                  <DisasterDisability personName={childName} />
                )}
              </Box>
            </div>
          )
        )}
    </>
  );
};

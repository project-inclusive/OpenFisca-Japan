import { useLocation } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import { householdAtom } from '../../state';

import configData from '../../config/app_config.json';

import { Birthday } from './attributes/Birthday';
import { Disability } from './attributes/Disability';
import { Income } from './attributes/Income';
import { Student } from './attributes/Student';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';
import { DisasterDisability } from './attributes/DisasterDisability';
import { DisasterInjuryPeriod } from './attributes/DisasterInjuryPeriod';
import { AgeInput } from './attributes/AgeInput';

export const FormParents = () => {
  const location = useLocation();
  const isDetailedCalculation = location.pathname === '/calculate';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const household = useRecoilValue(householdAtom);

  return (
    <>
      {household.世帯一覧.世帯1.祖父母一覧 &&
        household.世帯一覧.世帯1.祖父母一覧.map(
          (parentName: string, index: number) => (
            <div key={index}>
              <Box bg="white" borderRadius="xl" p={4} m={4}>
                <Center
                  fontSize={configData.style.subTitleFontSize}
                  fontWeight="medium"
                  mb="0.5em"
                >
                  {isDisasterCalculation && '存命の'}
                  {configData.calculationForm.parentDescription}
                  {`（${index + 1}人目）`}
                </Center>

                {isDisasterCalculation && (
                  <DisasterInjuryPeriod personName={parentName} />
                )}
                {isDisasterCalculation && (
                  <DisasterDisability personName={parentName} />
                )}

                {isDetailedCalculation && (
                  <AgeInput personName={parentName} mustInput={true} />
                )}
                {isDetailedCalculation && (
                  <Income personName={parentName} mustInput={true} />
                )}
                {isDetailedCalculation && <Student personName={parentName} />}
                {isDetailedCalculation && <Working personName={parentName} />}
                {isDetailedCalculation && (
                  <Disability personName={parentName} />
                )}
                {isDetailedCalculation && (
                  <Recuperation personName={parentName} />
                )}
                {isDetailedCalculation && (
                  <NursingHome personName={parentName} />
                )}
              </Box>
            </div>
          )
        )}
    </>
  );
};

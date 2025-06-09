import { Box, Center } from '@chakra-ui/react';
import { useLocation, useNavigationType } from 'react-router-dom';

import configData from '../../config/app_config.json';
import { PrefectureMunicipality } from './attributes/PrefectureMunicipality';
import { AgeInput } from './attributes/AgeInput';
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
import { DisasterDeath } from './attributes/DisasterDeath';
import { DisasterDisability } from './attributes/DisasterDisability';
import { HouseholdGoodsDamage } from './attributes/HouseholdGoodsDamage';
import { HousingDamage } from './attributes/HousingDamage';
import { HousingReconstruction } from './attributes/HousingReconstruction';
import { DisasterInjuryPeriod } from './attributes/DisasterInjuryPeriod';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../state';
import { Injury } from './attributes/Injury';
import { Difficulty } from './attributes/Difficulty';

export const FormYou = () => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const location = useLocation();
  const isDetailedCalculation = location.pathname === '/calculate';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const [household, setHousehold] = useRecoilState(householdAtom);

  // stored states set value when page transition
  useEffect(() => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.被災している = {
      [currentDate]: isDisasterCalculation,
    };

    setHousehold({ ...newHousehold });
  }, [navigationType, isDisasterCalculation]);

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
        {isDetailedCalculation && (
          <AgeInput personName={yourName} mustInput={true} you={true} />
        )}
        <Income personName={yourName} mustInput={true} />

        {isDisasterCalculation && <HousingDamage />}
        {isDisasterCalculation && <HousingReconstruction />}
        {isDisasterCalculation && <HouseholdGoodsDamage />}
        {isDisasterCalculation && (
          <DisasterInjuryPeriod personName={yourName} />
        )}
        {isDisasterCalculation && <DisasterDisability personName={yourName} />}
        {isDisasterCalculation && <DisasterDeath />}

        {isDetailedCalculation && <Deposit personName={yourName} />}
        {isDetailedCalculation && <Student personName={yourName} />}
        {isDetailedCalculation && <Working personName={yourName} />}
        {isDetailedCalculation && <Disability personName={yourName} />}
        {isDetailedCalculation && <Injury personName={yourName} />}
        {isDetailedCalculation && <Recuperation personName={yourName} />}
        {isDetailedCalculation && <NursingHome personName={yourName} />}
        <SpouseExists />
        <ChildrenNum />
        {(isDetailedCalculation || isDisasterCalculation) && <ParentsNum />}
        {isDetailedCalculation && <Pregnant personName={yourName} />}
        {isDetailedCalculation && <RentingHouse />}
        {isDetailedCalculation && <Difficulty />}
      </Box>
    </>
  );
};

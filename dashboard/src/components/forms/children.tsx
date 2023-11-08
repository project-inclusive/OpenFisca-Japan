import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Box, Center } from "@chakra-ui/react";

import configData from "../../config/app_config.json";
import { HouseholdContext } from "../../contexts/HouseholdContext";
import { Birthday } from "./attributes/Birthday";
import { Disability } from "./attributes/Disability";
import { AgeInput } from "./attributes/AgeInput";
import { Working } from "./attributes/Working";
import { Recuperation } from "./attributes/Recuperation";
import { NursingHome } from "./attributes/NursingHome";
import { HighSchool } from "./attributes/HighSchool";

export const FormChildren = () => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === "/calculate-simple";
  const { household, setHousehold } = useContext(HouseholdContext);

  return (
    <>
      {household.世帯.世帯1.子一覧 &&
        household.世帯.世帯1.子一覧.map((childName: string, index: number) => (
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

              {isSimpleCalculation ? (
                <AgeInput personName={childName} mustInput />
              ) : (
                <Birthday personName={childName} mustInput={true} />
              )}
              {!isSimpleCalculation && <HighSchool personName={childName} />}
              {!isSimpleCalculation && <Working personName={childName} />}
              {!isSimpleCalculation && <Disability personName={childName} />}
              {!isSimpleCalculation && <Recuperation personName={childName} />}
              {!isSimpleCalculation && <NursingHome personName={childName} />}
            </Box>
          </div>
        ))}
    </>
  );
};

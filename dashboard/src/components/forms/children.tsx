import { useContext } from "react";
import { Box, Center, Checkbox } from "@chakra-ui/react";

import configData from "../../app_config.json";
import { HouseholdContext } from "../../contexts/HouseholdContext";
import { Birthday } from "./attributes/Birthday";
import { Disability } from "./attributes/Disability";

export const FormChildren = () => {
  const { household, setHousehold } = useContext(HouseholdContext);
  return (
    <>
      {household.世帯.世帯1.児童一覧 &&
        household.世帯.世帯1.児童一覧.map(
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
                <Birthday personName={childName} mustInput={true} />
                <Disability personName={childName} />
              </Box>
            </div>
          )
        )}
    </>
  );
};

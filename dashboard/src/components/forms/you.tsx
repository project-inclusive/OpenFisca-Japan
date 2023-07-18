import { Box, Center } from "@chakra-ui/react";

import configData from "../../app_config.json";
import { Birthday } from "./attributes/Birthday";
import { Student } from "./attributes/Student";
import { ChildrenNum } from "./attributes/ChildrenNum";
import { ParentsNum } from "./attributes/ParentsNum";
import { SpouseExists } from "./attributes/SpouseExists";
import { Income } from "./attributes/Income";
import { Disability } from "./attributes/Disability";
import { RentingHouse } from "./attributes/RentingHouse";

export const FormYou = () => {
  const yourName = "あなた";
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
        <Birthday personName={yourName} mustInput={true} />
        <Income personName={yourName} mustInput={true} />
        <Disability personName={yourName} />
        <Student personName={yourName} />
        <SpouseExists />
        <ChildrenNum />
        <ParentsNum />
        <RentingHouse />
      </Box>
    </>
  );
};

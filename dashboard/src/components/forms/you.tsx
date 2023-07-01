import { Box, Center } from "@chakra-ui/react";

import configData from "../../app_config.json";
import { Birthday } from "./attributes/Birthday";
import { Student } from "./attributes/Student";
import { ChildrenNum } from "./attributes/ChildrenNum";
import { SpouseExists } from "./attributes/SpouseExists";
import { Income } from "./attributes/Income";
import { Disability } from "./attributes/Disability";

export const FormYou = () => {
  const yourName = "あなた";
  return (
    <>
      <Box bg="white" borderRadius="xl" p={4} m={4}>
        <Center
          fontSize={configData.style.subTitleFontSize}
          fontWeight="medium"
          mb="0.5em"
        >
          {configData.calculationForm.youDescription}
        </Center>
        <Birthday personName={yourName} />
        <Disability personName={yourName} />
        <Student personName={yourName} />
        <Income personName={yourName} />
        <SpouseExists />
        <ChildrenNum />
      </Box>
    </>
  );
};

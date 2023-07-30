import { useLocation } from "react-router-dom";
import { Box, Center, Button } from "@chakra-ui/react";

import configData from "../../config/app_config.json";
import { Benefit } from "./benefit";
import { Loan } from "./loan";

export const Result = () => {
  const location = useLocation();
  const { result, currentDate } = location.state as {
    result: any;
    currentDate: string;
  };

  return (
    <div>
      <Center
        fontSize={configData.style.subTitleFontSize}
        fontWeight="medium"
        mt={2}
        mb={2}
      >
        {configData.result.topDescription}
      </Center>

      <Benefit result={result} currentDate={currentDate} />
      <Loan result={result} currentDate={currentDate} />

      <Center pr={4} pl={4} pb={4}>
        {configData.result.questionnaireDescription[0]}
      </Center>

      <Center pr={4} pl={4} pb={4}>
        {/* When returning to this calculation result page from the questionnaire form on a PC browser (Chrome, Edge) deployed by Netlify, it will be 404, so open it in a new tab */}
        <Button
          as="a"
          href={configData.URL.questionnaire_form}
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: "cyan.700" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          アンケートに答える
        </Button>
      </Center>
    </div>
  );
};

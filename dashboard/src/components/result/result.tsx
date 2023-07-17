import { useLocation } from "react-router-dom";
import { Box, Center, Button } from "@chakra-ui/react";

import configData from "../../app_config.json";
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
    </div>
  );
};

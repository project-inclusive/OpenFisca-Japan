import { Box, Button, Center } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import configData from "../../config/app_config.json";

export const FormResponseError = () => {
  const location = useLocation();
  const { isSimpleCalculation } = location.state as {
    isSimpleCalculation: boolean;
  };

  return (
    <Box bg="white" borderRadius="xl" p={4} mt={4} mb={4} ml={4} mr={4}>
      <Center mb={4} fontSize={configData.style.subTitleFontSize}>
        <h1>予期せぬエラーが発生しました</h1>
      </Center>
      <Center mb={4}>
        <div>お手数ですがもう一度情報を入力してください。</div>
      </Center>

      <Center pr={4} pl={4} pb={4} mt={8} style={{ textAlign: "center" }}>
        <Button
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: "cyan.700" }}
          as={RouterLink}
          to={isSimpleCalculation ? "/calculate-simple" : "/calculate"}
        >
          戻る
        </Button>
      </Center>
    </Box>
  );
};

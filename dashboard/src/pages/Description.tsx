import { Link } from "react-router-dom";
import { Box, AbsoluteCenter, Center, Button } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import configData from "../app_config.json";

function Description() {
  return (
    // TODO: GitHubとproj-inclusiveのリンクアイコン追加
    <>
      <Box bg="white" borderRadius="xl" p={4} m={4}>
        <Center
          fontSize={configData.style.titleFontSize}
          fontWeight="semibold"
          mb="0.5em"
        >
          {configData.description.title}
        </Center>

        <Center fontSize={configData.style.subTitleFontSize} mb="0.5em">
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[0]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[0]}
        </Box>

        <Center fontSize={configData.style.subTitleFontSize} mb="0.5em">
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[1]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[1]}
        </Box>

        <Center fontSize={configData.style.subTitleFontSize} mb="0.5em">
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[2]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[2]}
        </Box>
      </Box>
      <Center pr={4} pl={4} pb={4}>
        <Button
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: "cyan.700" }}
        >
          <Link to="/calculate">はじめる</Link>
        </Button>
      </Center>
    </>
  );
}

export default Description;

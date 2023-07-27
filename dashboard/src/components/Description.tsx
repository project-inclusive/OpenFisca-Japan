import { Link as RouterLink } from "react-router-dom";
import { Box, Center, Button, VStack, Image } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { FaGithub } from "react-icons/fa";

import configData from "../config/app_config.json";
import bokyuIcon from "../assets/bokyu_lab_icon_cyan.png";

function Description() {
  return (
    <>
      <Box bg="white" borderRadius="xl" p={4} m={4}>
        <Center
          fontSize={configData.style.titleFontSize}
          fontWeight="semibold"
          mb="0.5em"
        >
          {configData.description.title}
        </Center>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[0]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[0]}
        </Box>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[1]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[1]}
        </Box>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[2]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[2]}
        </Box>

        <Center>
          <a href={configData.防窮研究所URL}>
            <VStack mr={4}>
              <Image src={bokyuIcon} alt="防窮研究所" boxSize="2em" />
              <Box color="gray.600">About</Box>
            </VStack>
          </a>
          <a href={configData.Github_URL}>
            <VStack>
              <Icon as={FaGithub} boxSize="2em" color="cyan.600"></Icon>
              <Box color="gray.600">Github</Box>
            </VStack>
          </a>
        </Center>
      </Box>

      <Center pr={4} pl={4} pb={4}>
        <Button
          as={RouterLink}
          to="/calculate"
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: "cyan.700" }}
        >
          はじめる
        </Button>
      </Center>
    </>
  );
}

export default Description;

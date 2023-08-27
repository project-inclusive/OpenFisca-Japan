import { Link as RouterLink } from "react-router-dom";
import { Box, Center, Button, VStack, Image } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { FaGithub } from "react-icons/fa";

import configData from "../config/app_config.json";
import bokyuIcon from "../assets/bokyu_lab_icon_cyan.png";
import yadokariKunIcon from "../assets/yadokari-kun.png";

const screenWidth = window.innerWidth;
const isMobile = screenWidth <= 768;
console.log(screenWidth)
function Description() {
  return (
    <>
      <Box bg="white" borderRadius="xl" p={4} m={4}>
        {isMobile && <Image src={yadokariKunIcon} alt="yadokari kun icon" boxSize="3em" ml="15px"/>}
        <Center
          fontSize={configData.style.titleFontSize}
          fontWeight="semibold"
          mb="0.5em"
        >
          {configData.description.title}
        {!isMobile && <Image src={yadokariKunIcon} alt="yadokari kun icon" boxSize="3em" ml="15px"/>}
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
          <a href={configData.URL.contact}>
            <VStack mr={4}>
              <Image src={bokyuIcon} alt="防窮研究所" boxSize="2em" />
              <Box color="gray.600">Contact</Box>
            </VStack>
          </a>
          <a href={configData.URL.Github}>
            <VStack>
              <Icon as={FaGithub} boxSize="2em" color="cyan.600"></Icon>
              <Box color="gray.600">Github</Box>
            </VStack>
          </a>
        </Center>
      </Box>

      <Center pr={4} pl={4} pb={4} style={{ textAlign: "center" }}>
        <Button
          as={RouterLink}
          to="/calculate"
          style={{ marginRight: "8%" }}
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="4em"
          width="45%"
          bg="blue.500"
          color="white"
          _hover={{ bg: "blue.600" }}
        >
          くわしく
          <br />
          計算
        </Button>
        <Button
          as={RouterLink}
          to="/calculate-simple"
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="4em"
          width="45%"
          bg="teal.500"
          color="white"
          _hover={{ bg: "teal.600" }}
        >
          かんたん
          <br />
          計算
        </Button>
      </Center>
    </>
  );
}

export default Description;

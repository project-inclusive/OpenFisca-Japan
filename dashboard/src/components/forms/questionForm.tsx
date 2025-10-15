import {
  Button,
  Center,
  Flex,
  Icon,
  Link as ChakraLink,
  Box,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import configData from '../../config/app_config.json';
import { FaHome } from 'react-icons/fa';

export const QuestionForm = () => {
  const SelectionButton = ({
    selection,
    path,
  }: {
    selection: string;
    path: string;
  }) => (
    <Button
      as={Link}
      to={path}
      variant="outline"
      borderRadius="xl"
      height="2.5em"
      width="100%"
      bg="white"
      borderColor="black"
      color="black"
      _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
    >
      {selection}
    </Button>
  );

  return (
    <div>
      <Flex
        w="100%"
        justifyContent="left"
        alignItems="center"
        marginTop="0.5em"
      >
        <ChakraLink href="/" ml={0} paddingLeft="1.5em">
          <Icon as={FaHome} boxSize="2em" color="cyan.600" />
        </ChakraLink>
      </Flex>

      <Center
        fontSize={configData.style.subTitleFontSize}
        fontWeight="medium"
        mt={2}
        mb={2}
      >
        {configData.calculationForm.calculationSelectionDescription}
      </Center>
      <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
        <Center fontSize={configData.style.questionFormFontSize} mb={2}>
          <VStack>
            <SelectionButton
              selection={configData.calculationForm.simpleCalculation}
              path="/calculate-simple"
            />
            <SelectionButton
              selection={configData.calculationForm.detailedCalculation}
              path="/calculate"
            />
            <SelectionButton
              selection={configData.calculationForm.disasterCalculation}
              path="/calculate-disaster"
            />
          </VStack>
        </Center>
      </Box>
    </div>
  );
};

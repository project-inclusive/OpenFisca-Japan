import { useLocation } from 'react-router-dom';
import {
  Center,
  Button,
  propNames,
  Box,
  Icon,
  HStack,
  Flex,
  Link,
} from '@chakra-ui/react';

import configData from '../../config/app_config.json';
import { CalculationLabel } from './calculationLabel';
import { ReactNode } from 'react';
import { FaHome } from 'react-icons/fa';

export const Question = (props: { children: ReactNode }) => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === '/calculate-simple';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';

  return (
    <div>
      <Flex w="100%" justifyContent="space-around" alignItems="center">
        <Link href="/" ml={0} paddingLeft="1.5em">
          <Icon as={FaHome} boxSize="2em" color="cyan.600" />
        </Link>
        <Box ml="auto">
          <CalculationLabel
            text={
              isSimpleCalculation
                ? configData.calculationForm.simpleCalculation
                : isDisasterCalculation
                ? configData.calculationForm.disasterCalculation
                : configData.calculationForm.detailedCalculation
            }
            colour={
              isSimpleCalculation
                ? 'teal'
                : isDisasterCalculation
                ? 'orange'
                : 'blue'
            }
          />
        </Box>
      </Flex>

      <Center
        fontSize={configData.style.subTitleFontSize}
        fontWeight="medium"
        mt={2}
        mb={2}
      >
        {/* TODO: 引数から受け取る */}
        {configData.calculationForm.topDescription}
      </Center>

      <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
        <Center fontSize={configData.style.questionFormFontSize} mb={2}>
          <form>{props.children}</form>
        </Center>
      </Box>

      <Center pr={4} pl={4} pb={4}>
        <Button
          fontSize={configData.style.subTitleFontSize}
          style={{ marginRight: '10%' }}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: 'cyan.700' }}
          // TODO: 関数を設定
          onClick={() => {}}
        >
          前へ
        </Button>
        <Button
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: 'cyan.700' }}
          // TODO: 関数を設定
          onClick={() => {}}
        >
          次へ
        </Button>
      </Center>
    </div>
  );
};

import { useLocation } from 'react-router-dom';
import {
  Center,
  Button,
  Box,
  Icon,
  Flex,
  Link,
  Progress,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { CalculationLabel } from '../calculationLabel';
import { ReactNode } from 'react';
import { FaHome } from 'react-icons/fa';

export const Question = (props: {
  children: ReactNode;
  title: string;
  progress: number;
  maxProgress: number;
  backOnClick: () => void;
  nextOnClick: () => void;
}) => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === '/calculate-simple';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';

  return (
    <div>
      <Progress
        value={props.progress}
        max={props.maxProgress}
        marginTop="1em"
        marginBottom="0.5em"
      />
      <Flex w="100%" justifyContent="space-around" alignItems="center">
        <Link href="/" ml={0} paddingLeft="1.5em">
          <Icon as={FaHome} boxSize="3em" color="cyan.600" />
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
        mb={4}
      >
        {props.title}
      </Center>

      <Box bg="white" borderRadius="xl" p={4} m={4}>
        <Center fontSize={configData.style.questionFormFontSize} mb={2}>
          {props.children}
        </Center>
      </Box>

      <Center pr={4} pl={4} pb={4}>
        <Button
          fontSize={configData.style.subTitleFontSize}
          style={{ marginRight: '10%' }}
          borderRadius="xl"
          height="3.5em"
          width="100%"
          bg="white"
          color="cyan.600"
          _hover={{ bg: 'cyan.700', color: 'white' }}
          onClick={props.backOnClick}
        >
          前へ
        </Button>
        <Button
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="3.5em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: 'cyan.700' }}
          onClick={props.nextOnClick}
        >
          次へ
        </Button>
      </Center>
    </div>
  );
};

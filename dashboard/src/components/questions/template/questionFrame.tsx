import { useLocation } from 'react-router-dom';
import { Center, Button, Box, Icon, Flex, Progress } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { CalculationLabel } from '../../forms/calculationLabel';
import { ReactNode } from 'react';
import { NarrowWidth } from '../../layout/narrowWidth';
import { HomeButton } from '../../homeButton';
import { useRecoilValue } from 'recoil';
import { questionKeyHistoryAtom } from '../../../state';

export const QuestionFrame = (props: {
  children: ReactNode;
  title: string;
  progress: number;
  backOnClick: () => void;
  nextOnClick: () => void;
  hasHistory: boolean;
}) => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === '/calculate-simple';
  const isDisasterCalculation = location.pathname === '/calculate-disaster';

  const questionKeyHistory = useRecoilValue(questionKeyHistoryAtom);

  return (
    <NarrowWidth>
      <div>
        <Progress
          value={props.progress}
          max={1}
          marginTop="1em"
          marginBottom="0.5em"
        />
        <Flex w="100%" justifyContent="space-around" alignItems="center">
          <HomeButton />
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
            _hover={
              props.hasHistory ? { bg: 'cyan.700', color: 'white' } : undefined
            }
            onClick={props.backOnClick}
            isDisabled={!props.hasHistory}
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
    </NarrowWidth>
  );
};

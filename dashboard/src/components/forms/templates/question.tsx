import { useLocation } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { CalculationLabel } from '../calculationLabel';
import { ReactNode } from 'react';
import { HomeButton } from '../../homeButton';
import { useRecoilValue } from 'recoil';
import { questionKeyHistoryAtom } from '../../../state';
import { FlowNavigation, FlowShell } from '../../layout/flowShell';

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

  const questionKeyHistory = useRecoilValue(questionKeyHistoryAtom);
  const noHistory = questionKeyHistory.length === 0;

  return (
    <FlowShell
      progress={props.progress}
      maxProgress={props.maxProgress}
      header={
        <>
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
        </>
      }
      title={props.title}
      navigation={
        <FlowNavigation
          onBack={props.backOnClick}
          onNext={props.nextOnClick}
          backDisabled={noHistory}
        />
      }
    >
      {props.children}
    </FlowShell>
  );
};

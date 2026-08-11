import { Box, Button, Center, Flex, Progress } from '@chakra-ui/react';
import { ReactNode } from 'react';

import configData from '../../config/app_config.json';
import { NarrowWidth } from './narrowWidth';

export type FlowShellProps = {
  children: ReactNode;
  title?: ReactNode;
  header?: ReactNode;
  navigation?: ReactNode;
  progress?: number;
  maxProgress?: number;
  progressLabel?: string;
};

export const FlowShell = ({
  children,
  title,
  header,
  navigation,
  progress,
  maxProgress,
  progressLabel = '進捗',
}: FlowShellProps) => {
  const hasProgress = progress !== undefined && maxProgress !== undefined;

  return (
    <NarrowWidth>
      <Box>
        {hasProgress ? (
          <Progress
            aria-label={progressLabel}
            value={progress}
            max={maxProgress}
            marginTop="1em"
            marginBottom="0.5em"
          />
        ) : null}

        {header !== undefined ? (
          <Flex w="100%" justifyContent="space-around" alignItems="center">
            {header}
          </Flex>
        ) : null}

        {title !== undefined ? (
          <Center
            as="h1"
            fontSize={configData.style.subTitleFontSize}
            fontWeight="medium"
            mt={2}
            mb={4}
          >
            {title}
          </Center>
        ) : null}

        <Box bg="white" borderRadius="xl" p={4} m={4}>
          <Center fontSize={configData.style.questionFormFontSize} mb={2}>
            {children}
          </Center>
        </Box>

        {navigation}
      </Box>
    </NarrowWidth>
  );
};

export type FlowNavigationProps = {
  onNext: () => void;
  onBack?: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  backLabel?: ReactNode;
  nextLabel?: ReactNode;
  ariaLabel?: string;
  highContrast?: boolean;
};

export const FlowNavigation = ({
  onNext,
  onBack,
  backDisabled = false,
  nextDisabled = false,
  backLabel = '前へ',
  nextLabel = '次へ',
  ariaLabel = 'フォーム操作',
  highContrast = false,
}: FlowNavigationProps) => {
  const primaryColor = highContrast ? 'cyan.800' : 'cyan.600';
  const hoverColor = highContrast ? 'cyan.900' : 'cyan.700';
  const disabledPrimaryStyle =
    highContrast && nextDisabled
      ? {
          opacity: 1,
          background: '#e2e8f0',
          color: '#1a202c',
          borderColor: '#718096',
          cursor: 'not-allowed',
        }
      : undefined;

  return (
    <Center as="nav" aria-label={ariaLabel} pr={4} pl={4} pb={4}>
      {onBack !== undefined ? (
        <Button
          type="button"
          fontSize={configData.style.subTitleFontSize}
          style={{ marginRight: '10%' }}
          borderRadius="xl"
          height="3.5em"
          width="100%"
          bg="white"
          color={primaryColor}
          _hover={backDisabled ? undefined : { bg: hoverColor, color: 'white' }}
          _focusVisible={{ boxShadow: 'outline' }}
          onClick={onBack}
          isDisabled={backDisabled}
        >
          {backLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        fontSize={configData.style.subTitleFontSize}
        borderRadius="xl"
        height="3.5em"
        width="100%"
        bg={primaryColor}
        color="white"
        _hover={
          highContrast && nextDisabled
            ? { bg: 'gray.200', color: 'gray.800' }
            : { bg: hoverColor }
        }
        _focusVisible={{ boxShadow: 'outline' }}
        _disabled={
          highContrast
            ? {
                opacity: '1 !important',
                bg: 'gray.200 !important',
                color: 'gray.800 !important',
                borderColor: 'gray.600 !important',
              }
            : undefined
        }
        onClick={onNext}
        isDisabled={nextDisabled}
        style={disabledPrimaryStyle}
      >
        {nextLabel}
      </Button>
    </Center>
  );
};

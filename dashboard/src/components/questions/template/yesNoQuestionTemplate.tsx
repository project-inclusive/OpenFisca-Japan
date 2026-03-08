import { ReactNode, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Button,
  VStack,
  Center,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { ErrorMessage } from '../../forms/validation/ErrorMessage';
import { useRecoilState } from 'recoil';
import { questionValidatedAtom } from '../../../state';
import {
  BooleanQuestion,
  BooleanQuestionKey,
} from '../../../state/questionDefinition';

export const YesNoQuestionTemplate = ({
  title,
  initialValue,
  assignFunc,
  children,
}: {
  title: BooleanQuestionKey;
  initialValue: BooleanQuestion;
  assignFunc: (question: BooleanQuestion) => void;
  children?: ReactNode;
}) => {
  const [boolState, setBoolState] = useState<boolean | undefined>(
    initialValue.selection
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  useEffect(() => {
    setQuestionValidated(boolState != null);
  }, [boolState]);

  const btn = ({
    cond,
    state,
    title,
  }: {
    cond: () => boolean;
    state: boolean;
    title: string;
  }) => (
    <Button
      mb={2}
      variant="outline"
      borderRadius="xl"
      height="3.5em"
      width="100%"
      bg={cond() ? 'cyan.600' : 'white'}
      borderColor={cond() ? 'cyan.900' : 'black'}
      color={cond() ? 'white' : 'black'}
      _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
      onClick={() => {
        // 選択肢の表示を更新
        setBoolState(state);
        assignFunc({ type: 'Boolean', selection: state });
      }}
    >
      {title}
    </Button>
  );

  return (
    <VStack flex={1}>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.itemFontSize}>
          <Center mb={4}>
            <Box
              fontSize={configData.style.subTitleFontSize}
              textAlign="center"
            >
              {title}
            </Box>
          </Center>
        </FormLabel>
        <Box mb={2}>{children}</Box>

        <VStack mt={8} mb={8}>
          {btn({
            cond: () => boolState === true,
            state: true,
            title: 'はい',
          })}
          {btn({
            cond: () => boolState === false,
            state: false,
            title: 'いいえ',
          })}
        </VStack>
      </FormControl>
    </VStack>
  );
};

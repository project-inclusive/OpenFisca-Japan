import { useEffect, useState } from 'react';
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
  SelectionQuestion,
  selectionQuestionDefinitions,
  SelectionQuestionKey,
} from '../../../state/questionDefinition';

type Selection<T extends SelectionQuestionKey> =
  (typeof selectionQuestionDefinitions)[T]['selections'][number];

export const SelectionQuestionTemplate = <T extends SelectionQuestionKey>({
  title,
  selections,
  initialValue,
  assignFunc,
}: {
  title: T;
  selections: readonly Selection<T>[];
  initialValue?: SelectionQuestion<T>;
  assignFunc: (question: SelectionQuestion<T>) => void;
}) => {
  const [selectionState, setSelectionState] = useState<
    Selection<T> | undefined
  >(initialValue?.selection);
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  useEffect(() => {
    setQuestionValidated(selectionState != null);
  }, [selectionState, title, initialValue]);

  const btn = ({
    cond,
    selection,
    key,
  }: {
    cond: () => boolean;
    selection: (typeof selectionQuestionDefinitions)[T]['selections'][number];
    key: number;
  }) => (
    <Button
      mb={2}
      key={key}
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
        setSelectionState(selection);
        assignFunc({ type: 'Selection', selection: selection });
      }}
    >
      {selection}
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

        <VStack mt={8} mb={8}>
          {selections.map((selection, index) =>
            btn({
              cond: () => selectionState === selection,
              selection: selection,
              key: index,
            })
          )}
        </VStack>
      </FormControl>
    </VStack>
  );
};

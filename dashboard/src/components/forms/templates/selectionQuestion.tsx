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
import { ErrorMessage } from '../attributes/validation/ErrorMessage';
import { useRecoilState, useRecoilValue } from 'recoil';
import { householdAtom, questionValidatedAtom } from '../../../state';

export const SelectionQuestion = ({
  title,
  selections,
  defaultSelection,
}: {
  title: string;
  selections: { selection: string; onClick: () => void }[];
  defaultSelection: (household: any) => string | null;
}) => {
  const household = useRecoilValue(householdAtom);
  const [selectionState, setSelectionState] = useState<string | null>(
    defaultSelection(household)
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  const btn = ({
    cond,
    selection,
    onClick,
    key,
  }: {
    cond: () => boolean;
    selection: string;
    onClick: () => void;
    key: number;
  }) => (
    <Button
      key={key}
      variant="outline"
      borderRadius="xl"
      height="2.5em"
      width="100%"
      bg={cond() ? 'cyan.600' : 'white'}
      borderColor={cond() ? 'cyan.900' : 'black'}
      color={cond() ? 'white' : 'black'}
      _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
      onClick={() => {
        setSelectionState(selection);
        setQuestionValidated(true);
        onClick();
      }}
    >
      {selection}
    </Button>
  );

  return (
    <>
      <ErrorMessage condition={selectionState == null} />
      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <Center>
            <Box fontSize={configData.style.itemFontSize}>{title}</Box>
          </Center>
        </FormLabel>

        <VStack mb={4}>
          {selections.map((e, index) =>
            btn({
              cond: () => selectionState === e.selection,
              selection: e.selection,
              onClick: e.onClick,
              key: index,
            })
          )}
        </VStack>
      </FormControl>
    </>
  );
};

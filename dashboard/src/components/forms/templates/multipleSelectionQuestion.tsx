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
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  householdAtom,
  questionValidatedAtom,
} from '../../../state';

export const MultipleSelectionQuestion = ({
  title,
  selections,
  defaultSelections,
}: {
  title: string;
  selections: { selection: string; enable: () => void; disable: () => void }[];
  defaultSelections: ({
    household,
    frontendHousehold,
  }: {
    household: any;
    frontendHousehold: any;
  }) => { [key: string]: boolean };
}) => {
  const household = useRecoilValue(householdAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  const [selectionsState, setSelectionsState] = useState<{
    [key: string]: boolean;
  }>(defaultSelections({ household, frontendHousehold }));
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  useEffect(() => {
    // 複数選択の場合、1つも選択しなくてもよいためバリデーションチェックは無条件で許可
    setQuestionValidated(true);
  }, []);

  const btn = ({
    cond,
    selection,
    enable,
    disable,
    key,
  }: {
    cond: () => boolean;
    selection: string;
    enable: () => void;
    disable: () => void;
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
        const copiedSelectionsState = { ...selectionsState };
        // 有効、無効を反転
        copiedSelectionsState[selection] = !copiedSelectionsState[selection];
        setSelectionsState(copiedSelectionsState);

        // 状態を反映
        if (copiedSelectionsState[selection]) {
          enable();
        } else {
          disable();
        }
      }}
    >
      {selection}
    </Button>
  );

  return (
    <>
      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <Center>
            <Box fontSize={configData.style.itemFontSize}>
              {title + '（複数選択）'}
            </Box>
          </Center>
        </FormLabel>

        <VStack mb={4}>
          {selections.map((e, index) =>
            btn({
              cond: () => selectionsState[e.selection],
              selection: e.selection,
              enable: e.enable,
              disable: e.disable,
              key: index,
            })
          )}
        </VStack>
      </FormControl>
    </>
  );
};

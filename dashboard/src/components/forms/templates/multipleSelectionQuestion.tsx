import { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Button,
  VStack,
  Center,
  keyframes,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  questionKeyAtom,
  questionValidatedAtom,
} from '../../../state';
import { personNameFrom } from '../../../question';

export const MultipleSelectionQuestion = ({
  title,
  selections,
}: {
  title: string;
  selections: { selection: string; enable: () => void; disable: () => void }[];
}) => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const personName = personNameFrom(questionKey);

  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  const [selectionsState, setSelectionsState] = useState<{
    [key: string]: boolean;
  }>(
    Object.fromEntries(
      selections.map((s) => [
        s.selection,
        frontendHousehold.世帯員[personName][s.selection],
      ])
    )
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  // すでに選択されていた場合、その選択肢を選んだ処理を再実施
  useEffect(() => {
    selections.map((s) => {
      selectionsState[s.selection] ? s.enable() : s.disable();
    });
  }, [selectionsState]);

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
        const copiedSelectionsState = { ...selectionsState };
        // 有効、無効を反転
        copiedSelectionsState[selection] = !copiedSelectionsState[selection];
        setSelectionsState(copiedSelectionsState);

        // 別ページから戻ってきたときのために選択肢を記録
        const newFrontendHousehold = { ...frontendHousehold };
        newFrontendHousehold.世帯員[personName][selection] =
          copiedSelectionsState[selection];
        setFrontendHousehold(newFrontendHousehold);

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
        <FormLabel fontSize={configData.style.itemFontSize}>
          <Center mb={4}>
            <Box
              fontSize={configData.style.subTitleFontSize}
              textAlign="center"
            >
              {title + '（複数選択）'}
            </Box>
          </Center>
        </FormLabel>

        <VStack mt={8} mb={8}>
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

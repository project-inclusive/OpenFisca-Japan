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
import { ErrorMessage } from '../validation/ErrorMessage';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  questionKeyAtom,
  questionValidatedAtom,
} from '../../../state';
import { personNameFrom } from '../../../question';

export const SelectionQuestion = ({
  title,
  selections,
}: {
  title: string;
  selections: { selection: string; onClick: () => void }[];
}) => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const personName = personNameFrom(questionKey);

  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );
  const [selectionState, setSelectionState] = useState<string | null>(
    frontendHousehold.世帯員[personName][questionKey.title]
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  useEffect(() => {
    if (selectionState != null) {
      setQuestionValidated(true);
    }
  }, [selectionState]);

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

        // 別ページから戻ってきたときのために選択肢を記録
        const newFrontendHousehold = { ...frontendHousehold };
        newFrontendHousehold.世帯員[personName][questionKey.title] = selection;
        setFrontendHousehold(newFrontendHousehold);

        onClick();
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
    </VStack>
  );
};

import { useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, VStack, Center } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { ErrorMessage } from '../validation/ErrorMessage';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  frontendHouseholdAtom,
  questionKeyAtom,
  questionValidatedAtom,
} from '../../../state';
import { personNameFrom } from '../../../question';
import { PressedChoiceButton } from '../PressedChoiceButton';

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
  const setQuestionValidated = useSetRecoilState(questionValidatedAtom);

  useEffect(() => {
    if (selectionState != null) {
      setQuestionValidated(true);
    }
  }, [selectionState, setQuestionValidated]);

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
          {selections.map((selection, index) => (
            <PressedChoiceButton
              key={index}
              isPressed={selectionState === selection.selection}
              onClick={() => {
                // 選択肢の表示を更新
                setSelectionState(selection.selection);

                // 別ページから戻ってきたときのために選択肢を記録
                const newFrontendHousehold = { ...frontendHousehold };
                newFrontendHousehold.世帯員[personName][questionKey.title] =
                  selection.selection;
                setFrontendHousehold(newFrontendHousehold);

                selection.onClick();
              }}
            >
              {selection.selection}
            </PressedChoiceButton>
          ))}
        </VStack>
      </FormControl>
    </VStack>
  );
};

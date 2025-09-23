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
import { ErrorMessage } from '../attributes/validation/ErrorMessage';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  frontendHouseholdAtom,
  questionKeyAtom,
  questionValidatedAtom,
} from '../../../state';
import { personNameFrom } from '../../../question';

export const YesNoQuestion = ({
  title,
  yesOnClick,
  noOnClick,
  children,
}: {
  title: string;
  yesOnClick: () => void;
  noOnClick: () => void;
  children?: ReactNode;
}) => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const personName = personNameFrom(questionKey);

  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );
  const [boolState, setBoolState] = useState<boolean | null>(
    frontendHousehold.世帯員[personName][questionKey.title]
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  // すでに選択されていた場合、その選択肢を選んだ処理を再実施
  useEffect(() => {
    if (boolState != null) {
      setQuestionValidated(true);
      boolState ? yesOnClick() : noOnClick();
    }
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
      variant="outline"
      borderRadius="xl"
      height="2.5em"
      width="100%"
      bg={cond() ? 'cyan.600' : 'white'}
      borderColor={cond() ? 'cyan.900' : 'black'}
      color={cond() ? 'white' : 'black'}
      _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
      onClick={() => {
        // 選択肢の表示を更新
        setBoolState(state);

        // 別ページから戻ってきたときのために選択肢を記録
        const newFrontendHousehold = { ...frontendHousehold };
        newFrontendHousehold.世帯員[personName][questionKey.title] = state;
        setFrontendHousehold(newFrontendHousehold);
      }}
    >
      {title}
    </Button>
  );

  return (
    <>
      <ErrorMessage condition={boolState == null} />

      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <Center>
            <Box fontSize={configData.style.itemFontSize}>{title}</Box>
          </Center>
        </FormLabel>
        <Box mt={2} mb={4}>
          {children}
        </Box>

        <VStack mb={4}>
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
    </>
  );
};

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
import {
  frontendHouseholdAtom,
  householdAtom,
  questionValidatedAtom,
} from '../../../state';

// TODO: タイトルやonClickを引数で変更可能にする
export const YesNoQuestion = ({
  title,
  yesOnClick,
  noOnClick,
  defaultSelection,
}: {
  title: string;
  yesOnClick: () => void;
  noOnClick: () => void;
  defaultSelection: ({
    household,
    frontendHousehold,
  }: {
    household: any;
    frontendHousehold: any;
  }) => boolean | null;
}) => {
  const household = useRecoilValue(householdAtom);
  const frontendHousehold = useRecoilValue(frontendHouseholdAtom);
  const [boolState, setBoolState] = useState<boolean | null>(
    defaultSelection({ household, frontendHousehold })
  );
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  useEffect(() => {
    if (boolState !== null) {
      setQuestionValidated(true);
    }
  }, [boolState]);

  const btn = ({
    cond,
    state,
    title,
    onClick,
  }: {
    cond: () => boolean;
    state: boolean;
    title: string;
    onClick: () => void;
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
        setBoolState(state);
        onClick();
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

        <VStack mb={4}>
          {btn({
            cond: () => boolState === true,
            state: true,
            title: 'はい',
            onClick: yesOnClick,
          })}
          {btn({
            cond: () => boolState === false,
            state: false,
            title: 'いいえ',
            onClick: noOnClick,
          })}
        </VStack>
      </FormControl>
    </>
  );
};

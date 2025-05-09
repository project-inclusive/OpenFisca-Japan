import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import {
  Box,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Button,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../attributes/validation/ErrorMessage';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { Question } from '../question';

// TODO: タイトルやonClickを引数で変更可能にする
export const YesNoQuestion = ({
  mustInput,
  subtitle,
}: {
  mustInput: boolean;
  subtitle: string;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [boolState, setBoolState] = useState<boolean | null>(null);
  // TODO: householdとboolStateを連携

  const currentDate = useRecoilValue(currentDateAtom);

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
        setBoolState(state);
      }}
    >
      {title}
    </Button>
  );

  return (
    <Question>
      {mustInput && <ErrorMessage condition={boolState == null} />}

      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <HStack>
            {/* TODO: 質問文を引数から受け取る */}
            <Box fontSize={configData.style.itemFontSize}>{subtitle}</Box>
            {mustInput && (
              <Box color="red" fontSize="0.7em">
                必須
              </Box>
            )}
          </HStack>
        </FormLabel>

        <VStack mb={4}>
          {btn({ cond: () => boolState === true, state: true, title: 'はい' })}
          {btn({
            cond: () => boolState === false,
            state: false,
            title: 'いいえ',
          })}
        </VStack>
      </FormControl>
    </Question>
  );
};

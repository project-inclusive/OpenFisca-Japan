import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Button,
  Input,
  Spacer,
  SimpleGrid,
  Center,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { useRecoilState } from 'recoil';
import { questionValidatedAtom } from '../../../state';
import { PersonNumQuestion } from '../../../state/questionDefinition';
import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { ErrorMessage } from '../../forms/validation/ErrorMessage';

export const PersonNumQuestionTemplate = ({
  title,
  assignFunc,
  initialValue,
  maxPersonNum,
}: {
  title: string;
  assignFunc: (question: PersonNumQuestion) => void;
  initialValue?: PersonNumQuestion;
  maxPersonNum: number;
}) => {
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [shownPersonNum, setShownPersonNum] = useState<string | number>(
    initialValue?.selection !== undefined ? initialValue.selection : ''
  );
  const [actualPersonNum, setActualPersonNum] = useState<number>(
    initialValue?.selection ?? 0
  );
  const [formValidated, setFormValidated] = useState<boolean>(
    shownPersonNum !== ''
  );
  const inputEl = useRef<HTMLInputElement>(null);

  const [boolState, setBoolState] = useState<boolean | null>(
    initialValue?.selection === undefined ? null : initialValue.selection !== 0
  );

  // チェックされたときに人数のフォームにフォーカス
  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, [boolState]);

  useEffect(() => {
    setQuestionValidated(
      boolState === false || (boolState === true && formValidated)
    );
  }, [boolState, title, initialValue]);

  const updatePersonInfo = (personNum: number) => {
    assignFunc({ type: 'PersonNum', selection: personNum });
  };

  // 「人数」フォームの変更時
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
      if (isWindows && (isChrome || isEdge || isChromium)) {
        if (
          event.nativeEvent instanceof InputEvent &&
          event.nativeEvent.isComposing
        ) {
          return;
        }
      }

      let personNum: number | string = toHalf(event.target.value);
      personNum = personNum.replace(/[^0-9]/g, '');
      personNum = parseInt(personNum);

      // 数値を更新したため「はい」を選択したとみなす
      setBoolState(true);

      // 正の整数以外は0に変換
      if (isNaN(personNum) || personNum <= 0) {
        personNum = 0;
        setShownPersonNum('');
        setFormValidated(false);
      } else if (personNum > maxPersonNum) {
        // 大きすぎる入力値は最大値に置換
        personNum = maxPersonNum;
        setShownPersonNum(personNum);
        setFormValidated(true);
      } else {
        setShownPersonNum(personNum);
        setFormValidated(true);
      }

      setActualPersonNum(personNum);
      updatePersonInfo(personNum);
    },
    [title, boolState, initialValue]
  );

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
        setBoolState(state);
        onClick();

        // 「はい」の場合はフォームの人数、「いいえ」の場合は0人に設定
        const newPersonNum = state ? actualPersonNum : 0;
        updatePersonInfo(newPersonNum);
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

        <SimpleGrid columns={2} rowGap={1} columnGap={6} mt={8} mb={8}>
          {btn({
            cond: () => boolState === true,
            state: true,
            title: 'はい',
            onClick: () => {
              // 「はい」の場合は人数も入力されている必要がある
              setQuestionValidated(formValidated);
              updatePersonInfo(actualPersonNum);
            },
          })}
          <FormControl>
            <HStack>
              <Input
                height="3.5em"
                type={isMobile ? 'number' : 'text'}
                value={shownPersonNum}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const newPersonNum = Number(shownPersonNum) + 1;
                    setShownPersonNum(newPersonNum);
                    updatePersonInfo(newPersonNum);
                  }

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    let newPersonNum = Number(shownPersonNum) - 1;
                    if (newPersonNum < 0) {
                      newPersonNum = 0;
                    }
                    setShownPersonNum(newPersonNum);
                    updatePersonInfo(newPersonNum);
                  }
                }}
                width="100%"
                ref={inputEl}
                {...(isMobile && { pattern: '[0-9]*' })}
              />
              <Box>人</Box>
            </HStack>
          </FormControl>
          {btn({
            cond: () => boolState === false,
            state: false,
            title: 'いいえ',
            onClick: () => {
              // 「いいえ」の場合は人数フォームの内容は不問
              setQuestionValidated(true);
              // 世帯員を削除
              updatePersonInfo(0);
            },
          })}
          <Spacer />
        </SimpleGrid>
      </FormControl>
    </VStack>
  );
};

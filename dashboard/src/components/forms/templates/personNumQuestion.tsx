import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';
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

import { useRecoilState, useRecoilValue } from 'recoil';
import {
  householdAtom,
  questionValidatedAtom,
  frontendHouseholdAtom,
  questionKeyAtom,
} from '../../../state';
import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { ErrorMessage } from '../validation/ErrorMessage';

export const PersonNumQuestion = ({
  updatePersonInfo,
  defaultNum,
  maxPerson,
  title,
}: {
  updatePersonInfo: (personNum: number) => void;
  defaultNum: (household: any) => number | null;
  maxPerson: number;
  title: string;
}) => {
  const questionKey = useRecoilValue(questionKeyAtom);
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [formValidated, setFormValidated] = useState<boolean>(false);
  const [yesNoValidated, setYesNoValidated] = useState<boolean>(false);

  const [shownPersonNum, setShownPersonNum] = useState<string | number>(
    frontendHousehold.世帯[questionKey.title]
      ? (frontendHousehold.世帯[questionKey.title] as number)
      : ''
  );
  const [actualPersonNum, setActualPersonNum] = useState<number>(0);
  const inputEl = useRef<HTMLInputElement>(null);

  const [boolState, setBoolState] = useState<boolean | null>(
    frontendHousehold.世帯[questionKey.title] === undefined
      ? null
      : frontendHousehold.世帯[questionKey.title] !== 0
  );

  useEffect(() => {
    if (boolState === null) {
      return;
    }
    updatePersonInfo(shownPersonNum ? Number(shownPersonNum) : 0);
    if (
      (boolState && shownPersonNum === 0) ||
      (boolState && shownPersonNum === '')
    ) {
      setQuestionValidated(false);
    } else {
      setQuestionValidated(true);
    }
  }, [questionKey]);

  // チェックされたときに人数のフォームにフォーカス
  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, [boolState]);

  // 「子どもの数」フォームの変更時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        // 前回と同じ値を設定して終了
        // （設定しないままreturnすると未変換の全角入力が残ってしまいエンターキーを押すまで反映できなくなってしまう）
        setHousehold({ ...household });
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
      // 「はい」の場合はバリエーションエラー
      setQuestionValidated(boolState ? false : yesNoValidated);
    } else if (personNum > maxPerson) {
      personNum = maxPerson;
      setShownPersonNum(personNum);
      setFormValidated(true);
      setQuestionValidated(true);
    } else {
      setShownPersonNum(personNum);
      setFormValidated(true);
      setQuestionValidated(true);
    }

    setActualPersonNum(personNum);
    updatePersonInfo(personNum);

    const newFrontendHousehold = { ...frontendHousehold };
    newFrontendHousehold.世帯[questionKey.title] = personNum;
    setFrontendHousehold(newFrontendHousehold);
  }, []);

  // stored states set displayed value when page transition
  useEffect(() => {
    defaultNum(household);
  }, [navigationType]);

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
        setYesNoValidated(true);
        onClick();

        // 「はい」の場合はフォームの人数、「いいえ」の場合は0人に設定
        const newPersonNum = state ? actualPersonNum : 0;
        const newFrontendHousehold = { ...frontendHousehold };
        newFrontendHousehold.世帯[questionKey.title] = newPersonNum;
        setFrontendHousehold(newFrontendHousehold);
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

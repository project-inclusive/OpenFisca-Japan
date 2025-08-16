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
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { useRecoilState } from 'recoil';
import { householdAtom, questionValidatedAtom } from '../../../state';
import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { ErrorMessage } from '../attributes/validation/ErrorMessage';

export const PersonNumQuestion = ({
  updatePersonInfo,
  defaultNum,
  maxPerson,
  title,
}: {
  updatePersonInfo: (personNum: number) => void;
  defaultNum: (household: any) => number;
  maxPerson: number;
  title: string;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);

  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [formValidated, setFormValidated] = useState<boolean>(false);
  const [yesNoValidated, setYesNoValidated] = useState<boolean>(false);

  const [shownPersonNum, setShownPersonNum] = useState<string | number>('');
  const [actualPersonNum, setActualPersonNum] = useState<number>(0);
  const inputEl = useRef<HTMLInputElement>(null);
  const [boolState, setBoolState] = useState<boolean | null>(null);

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

    // 正の整数以外は0に変換
    if (isNaN(personNum) || personNum < 0) {
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
      variant="outline"
      borderRadius="xl"
      height="2.5em"
      width="12em"
      bg={cond() ? 'cyan.600' : 'white'}
      borderColor={cond() ? 'cyan.900' : 'black'}
      color={cond() ? 'white' : 'black'}
      _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
      onClick={() => {
        setBoolState(state);
        setYesNoValidated(true);
        onClick();
      }}
    >
      {title}
    </Button>
  );

  return (
    <>
      <ErrorMessage />
      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <Center>
            <Box fontSize={configData.style.itemFontSize}>{title}</Box>
          </Center>
        </FormLabel>

        <SimpleGrid columns={2} rowGap={1} columnGap={6}>
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
                width="6em"
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
    </>
  );
};

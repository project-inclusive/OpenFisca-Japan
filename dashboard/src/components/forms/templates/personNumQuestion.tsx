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

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { Question } from '../question';
import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';

// TODO: タイトルやonClickを引数で変更可能にする
export const PersonNumQuestion = ({
  mustInput,
  subtitle,
}: {
  mustInput: boolean;
  subtitle: string;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);

  const currentDate = useRecoilValue(currentDateAtom);

  const [shownChildrenNum, setShownChildrenNum] = useState<string | number>('');
  const inputEl = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(false);
  // チェックボックスの値が変更された時
  // TODO: 子ども or 祖父母を指定可能にする
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked && household.世帯一覧.世帯1.子一覧) {
        const newHousehold = { ...household };
        household.世帯一覧.世帯1.子一覧.map((childName: string) => {
          delete newHousehold.世帯員[childName];
        });
        delete newHousehold.世帯一覧.世帯1.子一覧;
        setShownChildrenNum('');
        setHousehold({ ...newHousehold });
      }
      setIsChecked(event.target.checked);
    },
    []
  );

  // チェックされたときに「子どもの数」フォームにフォーカス
  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, [isChecked]);

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

    let childrenNum: number | string = toHalf(event.target.value);
    childrenNum = childrenNum.replace(/[^0-9]/g, '');
    childrenNum = parseInt(childrenNum);

    // 正の整数以外は0に変換
    if (isNaN(childrenNum) || childrenNum < 0) {
      childrenNum = 0;
      setShownChildrenNum('');
    } else if (childrenNum > 5) {
      childrenNum = 5;
      setShownChildrenNum(childrenNum);
    } else {
      setShownChildrenNum(childrenNum);
    }

    updateChildrenInfo(childrenNum);
  }, []);

  function updateChildrenInfo(childrenNum: number) {
    const newHousehold = { ...household };
    if (household.世帯一覧.世帯1.子一覧) {
      household.世帯一覧.世帯1.子一覧.map((childName: string) => {
        delete newHousehold.世帯員[childName];
      });
    }

    // 新しい子どもの情報を追加
    newHousehold.世帯一覧.世帯1.子一覧 = [...Array(childrenNum)].map(
      (val, i) => `子ども${i}`
    );
    if (newHousehold.世帯一覧.世帯1.子一覧) {
      newHousehold.世帯一覧.世帯1.子一覧.map((childName: string) => {
        newHousehold.世帯員[childName] = {};
      });
    }
    setHousehold({ ...newHousehold });
  }

  // stored states set displayed value when page transition
  useEffect(() => {
    const storedChildrenObj = household.世帯一覧.世帯1.子一覧;
    if (storedChildrenObj) {
      setIsChecked(true);
      setShownChildrenNum(storedChildrenObj.length);
    }
  }, [navigationType]);

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
      width="12em"
      bg={cond() ? 'cyan.600' : 'white'}
      borderColor={cond() ? 'cyan.900' : 'black'}
      color={cond() ? 'white' : 'black'}
      _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
      onClick={() => {
        setIsChecked(state);
      }}
    >
      {title}
    </Button>
  );

  return (
    <Question>
      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <Center>
            <HStack>
              {/* TODO: 質問文を引数から受け取る */}
              <Box fontSize={configData.style.itemFontSize}>{subtitle}</Box>
              {mustInput && (
                <Box color="red" fontSize="0.7em">
                  必須
                </Box>
              )}
            </HStack>
          </Center>
        </FormLabel>

        <SimpleGrid columns={2} rowGap={1} columnGap={6}>
          {btn({ cond: () => isChecked, state: true, title: 'はい' })}
          <FormControl>
            <HStack>
              <Input
                type={isMobile ? 'number' : 'text'}
                value={shownChildrenNum}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const newChildrenNum = Number(shownChildrenNum) + 1;
                    setShownChildrenNum(newChildrenNum);
                    updateChildrenInfo(newChildrenNum);
                  }

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    let newChildrenNum = Number(shownChildrenNum) - 1;
                    if (newChildrenNum < 0) {
                      newChildrenNum = 0;
                    }
                    setShownChildrenNum(newChildrenNum);
                    updateChildrenInfo(newChildrenNum);
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
            cond: () => !isChecked,
            state: false,
            title: 'いいえ',
          })}
          <Spacer />
        </SimpleGrid>
      </FormControl>
    </Question>
  );
};

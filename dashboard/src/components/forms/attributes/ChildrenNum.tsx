import { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import {
  Checkbox,
  Box,
  HStack,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

import { useRecoilState } from 'recoil';
import { householdAtom } from '../../../state';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';

export const ChildrenNum = () => {
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [shownChildrenNum, setShownChildrenNum] = useState<string | number>('');
  const inputEl = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(false);
  // チェックボックスの値が変更された時
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

  return (
    <>
      <Box mb={4}>
        <Checkbox
          colorScheme="cyan"
          isChecked={isChecked}
          onChange={onCheckChange}
        >
          {isDisasterCalculation && '存命の'}子どもがいる
        </Checkbox>
        {isChecked && (
          <FormControl mt={2} ml={4} mr={4} mb={4}>
            <FormLabel fontWeight="Regular">子どもの数</FormLabel>
            <HStack mb={4}>
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
                width="9em"
                ref={inputEl}
                {...(isMobile && { pattern: '[0-9]*' })}
              />
              <Box>人</Box>
            </HStack>
          </FormControl>
        )}
      </Box>
    </>
  );
};

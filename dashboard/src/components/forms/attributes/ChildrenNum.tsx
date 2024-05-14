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

  function toHalf(str: string): string {
    return str.replace(/[０-９]/g, function (m: string): string {
      return '０１２３４５６７８９'.indexOf(m).toString();
    });
  }

  // 「子どもの数」フォームの変更時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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

    // 変更前の子どもの情報を削除
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
  }, []);

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
                type="text"
                value={shownChildrenNum}
                onChange={onChange}
                width="9em"
                ref={inputEl}
              />
              <Box>人</Box>
            </HStack>
          </FormControl>
        )}
      </Box>
    </>
  );
};

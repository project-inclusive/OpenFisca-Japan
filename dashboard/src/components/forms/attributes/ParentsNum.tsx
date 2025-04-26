import { useCallback, useState, useRef, useEffect } from 'react';
import {
  Checkbox,
  Box,
  HStack,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useNavigationType } from 'react-router-dom';
import { householdAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';

export const ParentsNum = () => {
  const isDisasterCalculation = location.pathname === '/calculate-disaster';
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [shownLivingToghtherNum, setShownLivingToghtherNum] = useState<
    string | number
  >('');
  const inputEl = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(false);
  // チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked && household.世帯一覧.世帯1.祖父母一覧) {
        const newHousehold = { ...household };
        household.世帯一覧.世帯1.祖父母一覧.map((name: string) => {
          delete newHousehold.世帯員[name];
        });
        delete newHousehold.世帯一覧.世帯1.祖父母一覧;
        setShownLivingToghtherNum(0);
        setHousehold({ ...newHousehold });
      }
      setIsChecked(event.target.checked);
    },
    []
  );

  // チェックされたときに人数フォームにフォーカス
  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, [isChecked]);

  // 人数フォーム変更時
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

    let LivingToghtherNum: number | string = toHalf(event.target.value);
    LivingToghtherNum = LivingToghtherNum.replace(/[^0-9]/g, '');
    LivingToghtherNum = parseInt(LivingToghtherNum);

    // 正の整数以外は0に変換
    if (isNaN(LivingToghtherNum) || LivingToghtherNum < 0) {
      LivingToghtherNum = 0;
      setShownLivingToghtherNum('');
      // TODO: 算出に必要な最大人数に設定する
    } else if (LivingToghtherNum > 10) {
      LivingToghtherNum = 10;
      setShownLivingToghtherNum(LivingToghtherNum);
    } else {
      setShownLivingToghtherNum(LivingToghtherNum);
    }

    // 変更前の親または祖父母の情報を削除
    const newHousehold = { ...household };
    if (household.世帯一覧.世帯1.祖父母一覧) {
      household.世帯一覧.世帯1.祖父母一覧.map((name: string) => {
        delete newHousehold.世帯員[name];
      });
    }

    // 新しい親または祖父母の情報を追加
    newHousehold.世帯一覧.世帯1.祖父母一覧 = [...Array(LivingToghtherNum)].map(
      (val, i) => `親${i}`
    );
    if (newHousehold.世帯一覧.世帯1.祖父母一覧) {
      newHousehold.世帯一覧.世帯1.祖父母一覧.map((name: string) => {
        newHousehold.世帯員[name] = {};
      });
    }
    setHousehold({ ...newHousehold });
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShownLivingToghtherNum(Number(shownLivingToghtherNum) + 1);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShownLivingToghtherNum(
        Math.max(Number(shownLivingToghtherNum) - 1, 0)
      );
    }
  }

  // stored states set displayed value when page transition
  useEffect(() => {
    const storedObj = household.世帯一覧.世帯1.祖父母一覧;
    if (storedObj) {
      setIsChecked(true);
      setShownLivingToghtherNum(storedObj.length);
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
          {isDisasterCalculation && '存命の'}親または祖父母と同居している
        </Checkbox>
        {isChecked && (
          <FormControl mt={2} ml={4} mr={4} mb={4}>
            <FormLabel fontWeight="Regular">
              同居している親または祖父母の数
            </FormLabel>

            <HStack mb={4}>
              <Input
                type={isMobile ? 'number' : 'text'}
                value={shownLivingToghtherNum}
                onChange={onChange}
                onKeyDown={onKeyDown}
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

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

import { useRecoilValue, useRecoilState } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

import { toHalf } from '../../../utils/toHalf';

export const DisasterDeath = () => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [shownMemberNum, setShownMemberNum] = useState<number>(0);
  const inputEl = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(false);
  const [isMaintainerChecked, setIsMaintainerChecked] = useState(false);

  // debug
  useEffect(() => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.災害救助法の適用地域である = {
      [currentDate]: true,
    };
    newHousehold.世帯一覧.世帯1.被災者生活再建支援法の適用地域である = {
      [currentDate]: true,
    };
    setHousehold({ ...newHousehold });
  }, []);

  // 「災害で世帯員が亡くなった」チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked) {
        const newHousehold = { ...household };
        newHousehold.世帯一覧.世帯1.災害で死亡した世帯員の人数 = {
          [currentDate]: 0,
        };
        newHousehold.世帯一覧.世帯1.災害で生計維持者が死亡した = {
          [currentDate]: false,
        };
        setShownMemberNum(0);
        setIsMaintainerChecked(false);
        setHousehold({ ...newHousehold });
      }
      setIsChecked(event.target.checked);
    },
    []
  );

  // 「災害で世帯員が亡くなった」がチェックされたときに「亡くなった世帯員の数」フォームにフォーカス
  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, [isChecked]);

  // 「亡くなった世帯員の数」フォームの変更時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let memberNum: number | string = toHalf(event.target.value);
    memberNum = memberNum.replace(/[^0-9]/g, '');
    memberNum = parseInt(memberNum);

    // 正の整数以外は0に変換
    if (isNaN(memberNum) || memberNum < 0) {
      memberNum = 0;
      setShownMemberNum(0);
    } else {
      setShownMemberNum(memberNum);
    }

    const newHousehold = { ...household };
    // 「災害で死亡した世帯員の人数が0人」かつ「災害で生計維持者が死亡した」がTrue の状態にならないようにする
    if (memberNum == 0) {
      newHousehold.世帯一覧.世帯1.災害で生計維持者が死亡した = {
        [currentDate]: false,
      };
      setIsMaintainerChecked(false);
    }

    newHousehold.世帯一覧.世帯1.災害で死亡した世帯員の人数 = {
      [currentDate]: memberNum,
    };
    setHousehold({ ...newHousehold });
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShownMemberNum(shownMemberNum + 1);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShownMemberNum(Math.max(shownMemberNum - 1, 0));
    }
  }

  // 生計維持者のチェックボックスの値が変更された時
  const onMaintainerCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newHousehold = { ...household };
      const newHouseholdObj = newHousehold.世帯一覧.世帯1;
      if (event.target.checked) {
        newHouseholdObj.災害で生計維持者が死亡した = {
          [currentDate]: true,
        };
        if (
          // 「災害で死亡した世帯員の人数が0人」かつ「災害で生計維持者が死亡した」がTrue の状態にならないようにする
          !newHouseholdObj.災害で死亡した世帯員の人数 ||
          newHouseholdObj.災害で死亡した世帯員の人数[currentDate] === 0
        ) {
          newHouseholdObj.災害で死亡した世帯員の人数 = {
            [currentDate]: 1,
          };
          setShownMemberNum(1);
        }
      } else {
        newHouseholdObj.災害で生計維持者が死亡した = {
          [currentDate]: false,
        };
      }

      setHousehold({ ...newHousehold });
      setIsMaintainerChecked(event.target.checked);
    },
    []
  );

  // stored states set displayed value when page transition
  useEffect(() => {
    const householdObj = household.世帯一覧.世帯1;
    if (
      (householdObj.災害で死亡した世帯員の人数 &&
        householdObj.災害で死亡した世帯員の人数[currentDate] > 0) ||
      (householdObj.災害で生計維持者が死亡した &&
        householdObj.災害で生計維持者が死亡した[currentDate])
    ) {
      setIsChecked(true);
      setShownMemberNum(
        householdObj.災害で死亡した世帯員の人数 &&
          householdObj.災害で死亡した世帯員の人数[currentDate]
      );
      setIsMaintainerChecked(
        householdObj.災害で生計維持者が死亡した &&
          householdObj.災害で生計維持者が死亡した[currentDate]
      );
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onCheckChange}
      >
        災害で世帯員が亡くなった
      </Checkbox>
      {isChecked && (
        <FormControl mt={2} ml={4} mr={4} mb={4}>
          <FormLabel fontWeight="Regular">亡くなった世帯員の数</FormLabel>
          <HStack mb={4}>
            <Input
              type="text"
              value={shownMemberNum}
              onChange={onChange}
              onKeyDown={onKeyDown}
              width="9em"
              ref={inputEl}
            />
            <Box>人</Box>
          </HStack>

          <Checkbox
            isChecked={isMaintainerChecked}
            onChange={onMaintainerCheckChange}
            colorScheme="cyan"
            mb={2}
          >
            生計維持者（世帯で最も年収が多い方）が亡くなった
          </Checkbox>
        </FormControl>
      )}
    </Box>
  );
};

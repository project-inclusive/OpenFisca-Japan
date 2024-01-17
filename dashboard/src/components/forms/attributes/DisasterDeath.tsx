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

export const DisasterDeath = () => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [shownMemberNum, setShownMemberNum] = useState<string | number>('');
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
        setShownMemberNum('');
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
    let memberNum = parseInt(event.currentTarget.value);
    // 正の整数以外は0に変換
    if (isNaN(memberNum) || memberNum < 1) {
      memberNum = 1;
      setShownMemberNum('');
    } else {
      setShownMemberNum(memberNum);
    }

    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.災害で死亡した世帯員の人数 = {
      [currentDate]: memberNum,
    };
    setHousehold({ ...newHousehold });
  }, []);

  // 生計維持者のチェックボックスの値が変更された時
  const onMaintainerCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newHousehold = { ...household };
      if (event.target.checked) {
        newHousehold.世帯一覧.世帯1.災害で生計維持者が死亡した = {
          [currentDate]: true,
        };
      } else {
        newHousehold.世帯一覧.世帯1.災害で生計維持者が死亡した = {
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
      setShownMemberNum(householdObj.災害で死亡した世帯員の人数[currentDate]);
      setIsMaintainerChecked(
        householdObj.災害で生計維持者が死亡した[currentDate]
      );
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
          災害で世帯員が亡くなった
        </Checkbox>
        {isChecked && (
          <FormControl mt={2} ml={4} mr={4} mb={4}>
            <FormLabel fontWeight="Regular">亡くなった世帯員の数</FormLabel>
            <HStack mb={4}>
              <Input
                type="number"
                value={shownMemberNum}
                pattern="[1-9]*"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^1-9]/g,
                    ''
                  );
                }}
                onChange={onChange}
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
    </>
  );
};

import { useCallback, useContext, useState, useRef, useEffect } from "react";
import {
  Checkbox,
  Box,
  HStack,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";

export const ParentsNum = () => {
  const { household, setHousehold } = useContext(HouseholdContext);
  const [shownLivingToghtherNum, setShownLivingToghtherNum] = useState<
    string | number
  >("");
  const inputEl = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(false);
  // チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked && household.世帯.世帯1.親一覧) {
        const newHousehold = { ...household };
        household.世帯.世帯1.親一覧.map((name: string) => {
          delete newHousehold.世帯員[name];
        });
        delete newHousehold.世帯.世帯1.親一覧;
        setShownLivingToghtherNum("");
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
    let LivingToghtherNum = parseInt(event.currentTarget.value);
    // 正の整数以外は0に変換
    if (isNaN(LivingToghtherNum) || LivingToghtherNum < 0) {
      LivingToghtherNum = 0;
      setShownLivingToghtherNum("");
      // TODO: 算出に必要な最大人数に設定する
    } else if (LivingToghtherNum > 10) {
      LivingToghtherNum = 10;
      setShownLivingToghtherNum(LivingToghtherNum);
    } else {
      setShownLivingToghtherNum(LivingToghtherNum);
    }

    // 変更前の親または祖父母の情報を削除
    const newHousehold = { ...household };
    if (household.世帯.世帯1.親一覧) {
      household.世帯.世帯1.親一覧.map((name: string) => {
        delete newHousehold.世帯員[name];
      });
    }

    // 新しい親または祖父母の情報を追加
    newHousehold.世帯.世帯1.親一覧 = [...Array(LivingToghtherNum)].map(
      (val, i) => `親${i}`
    );
    if (newHousehold.世帯.世帯1.親一覧) {
      newHousehold.世帯.世帯1.親一覧.map((name: string) => {
        newHousehold.世帯員[name] = {};
      });
    }
    setHousehold({ ...newHousehold });
  }, []);

  return (
    <>
      <Box mb={4}>
        <Checkbox
          colorScheme="cyan"
          checked={isChecked}
          onChange={onCheckChange}
        >
          親または祖父母と同居している
        </Checkbox>
        {isChecked && (
          <FormControl mt={2} ml={4} mr={4} mb={4}>
            <FormLabel fontWeight="Regular">
              同居している親または祖父母の数
            </FormLabel>

            <HStack mb={4}>
              <Input
                type="number"
                value={shownLivingToghtherNum}
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

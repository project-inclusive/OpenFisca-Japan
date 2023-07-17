import { useCallback, useContext, useState, useRef, useEffect } from "react";
import { Checkbox, Box, HStack, Input } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const ParentsNum = () => {
  const currentDate = useContext(CurrentDateContext);
  const lastYearDate = `${new Date().getFullYear() - 1}-${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-01`;
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
        newHousehold.世帯.世帯1.親一覧 = [...newHousehold.世帯.世帯1.親一覧];
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
        newHousehold.世帯員[name] = {
          誕生年月日: { ETERNITY: "" },
          収入: { [currentDate]: 0 },
          身体障害者手帳等級認定: { ETERNITY: "無" },
          // 身体障害者手帳交付年月日は入力作業を省略させるため昨年の日付を設定
          // (身体障害者手帳等級認定は身体障害者手帳交付年月日から2年以内が有効)
          身体障害者手帳交付年月日: { ETERNITY: lastYearDate },
          療育手帳等級: { ETERNITY: "無" },
          愛の手帳等級: { ETERNITY: "無" },
          精神障害者保健福祉手帳等級: { ETERNITY: "無" },
          内部障害: { ETERNITY: "無" },
          脳性まひ_進行性筋萎縮症: { ETERNITY: "無" },
        };
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
          <Box mt={2} ml={4} mr={4} mb={4}>
            <Box>同居している親または祖父母の数</Box>
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
          </Box>
        )}
      </Box>
    </>
  );
};

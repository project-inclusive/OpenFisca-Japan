import { useCallback, useContext, useState } from "react";
import { Checkbox, Box, HStack } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const SpouseExists = () => {
  const currentDate = useContext(CurrentDateContext);
  const lastYearDate = `${new Date().getFullYear() - 1}-${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-01`;
  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);
  const spouseName = "配偶者";

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (!event.target.checked) {
      delete newHousehold.世帯員[spouseName];
      newHousehold.世帯.世帯1.保護者一覧 = ["あなた"];
      newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当[currentDate] = false;
      setIsChecked(false);
    } else {
      newHousehold.世帯.世帯1.保護者一覧.push(spouseName);
      newHousehold.世帯員[spouseName] = {
        誕生年月日: { ETERNITY: "" },
        収入: { [currentDate]: 0 },
        身体障害者手帳等級認定: { ETERNITY: "無" },
        // 身体障害者手帳交付年月日は入力作業を省略させるため昨年の日付を設定
        // (身体障害者手帳等級認定は身体障害者手帳交付年月日から2年以内が有効)
        身体障害者手帳交付年月日: { ETERNITY: lastYearDate },
        愛の手帳等級: { ETERNITY: "無" },
        精神障害者保健福祉手帳等級: { ETERNITY: "無" },
        内部障害: { ETERNITY: "無" },
        脳性まひ_進行性筋萎縮症: { ETERNITY: "無" },
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        checked={isChecked}
        onChange={onChange}
        mb={4}
      >
        配偶者がいる（事実婚の場合も含む）
      </Checkbox>
      <br></br>
    </>
  );
};

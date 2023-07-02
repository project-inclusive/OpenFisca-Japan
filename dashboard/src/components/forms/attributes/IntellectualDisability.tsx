import { useState, useCallback, useContext, useEffect } from "react";
import { Box, Select } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";

export const IntellectualDisability = ({
  personName,
}: {
  personName: string;
}) => {
  const { household, setHousehold } = useContext(HouseholdContext);

  // ラベルとOpenFiscaの表記違いを明記
  const aiItems = [
    ["", "無"],
    ["1度", "一度"],
    ["2度", "二度"],
    ["3度", "三度"],
    ["4度", "四度"],
  ];
  const ryoikuItems = [
    ["", "無"],
    ["A", "A"],
    ["B", "B"],
  ];
  const [selectedAiItemIndex, setSelectedAiItemIndex] = useState(0);
  const [selectedRyoikuItemIndex, setSelectedRyoikuItemIndex] = useState(0);

  // 「愛の手帳」コンボボックスの値が変更された時
  const onAiChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAiItemIndex(parseInt(event.currentTarget.value));
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].愛の手帳等級.ETERNITY =
        aiItems[parseInt(event.currentTarget.value)][1];
      setHousehold({ ...newHousehold });
    },
    []
  );
  // 「療育手帳」コンボボックスの値が変更された時
  const onRyoikuChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedRyoikuItemIndex(parseInt(event.currentTarget.value));
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].療育手帳等級.ETERNITY =
        ryoikuItems[parseInt(event.currentTarget.value)][1];
      setHousehold({ ...newHousehold });
    },
    []
  );

  // 「あなた」の「子どもの数」が変更されたときに全ての子どもの愛の手帳・療育等級が「無」に
  // リセットされるため、コンボボックスも空白に戻す
  useEffect(() => {
    if (household.世帯員[personName].愛の手帳等級) {
      aiItems.map((item, index) => {
        if (item[1] === household.世帯員[personName].愛の手帳等級.ETERNITY) {
          setSelectedAiItemIndex(index);
        }
      });
    }
  }, [household.世帯員[personName].愛の手帳等級]);

  useEffect(() => {
    if (household.世帯員[personName].療育手帳等級) {
      ryoikuItems.map((item, index) => {
        if (item[1] === household.世帯員[personName].療育手帳等級.ETERNITY) {
          setSelectedRyoikuItemIndex(index);
        }
      });
    }
  }, [household.世帯員[personName].療育手帳等級]);

  return (
    <>
      <Box>療育手帳</Box>
      <Select
        value={selectedRyoikuItemIndex}
        className="form-select"
        onChange={onRyoikuChange}
        mb={2}
      >
        {ryoikuItems.map((item, index) => (
          <option value={index} key={index}>
            {item[0]}
          </option>
        ))}
      </Select>

      <Box>愛の手帳</Box>
      <Select
        value={selectedAiItemIndex}
        className="form-select"
        onChange={onAiChange}
        mb={2}
      >
        {aiItems.map((item, index) => (
          <option value={index} key={index}>
            {item[0]}
          </option>
        ))}
      </Select>
    </>
  );
};

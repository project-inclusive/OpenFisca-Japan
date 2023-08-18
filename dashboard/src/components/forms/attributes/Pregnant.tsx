import { useState, useCallback, useContext, useEffect } from "react";
import { Select, FormControl, FormLabel } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const Pregnant = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);

  // ラベルとOpenFiscaの表記違いを明記
  const items = [
    ["", "無"],
    ["妊娠6ヵ月未満", "妊娠6ヵ月未満"],
    ["妊娠6ヵ月以上", "妊娠6ヵ月以上"],
    ["産後6ヵ月以内", "産後6ヵ月以内"],
  ];
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // コンボボックスの値が変更された時
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedItemIndex(parseInt(event.currentTarget.value));
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].妊産婦 =
        { [currentDate]: items[parseInt(event.currentTarget.value)][1] };
      setHousehold({ ...newHousehold });
    },
    []
  );

  return (
    <>
      <FormControl>
        <FormLabel fontWeight="Regular">妊娠している、または産後6ヵ月以内</FormLabel>
        <Select
          value={selectedItemIndex}
          className="form-select"
          onChange={onChange}
          mb={3}
        >
          {items.map((item, index) => (
            <option value={index} key={index}>
              {item[0]}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

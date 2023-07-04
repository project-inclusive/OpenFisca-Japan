import { KeyboardEvent, useCallback, useContext, useState } from "react";
import { Box, HStack, Input } from "@chakra-ui/react";

import { CurrentDateContext } from "../../../contexts/CurrentDateContext";
import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { ErrorMessage } from "./validation/ErrorMessage";

export const Income = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);

  const [shownIncome, setShownIncome] = useState<string | number>("");

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = {
      ...household,
    };

    // 「万円」単位を「円」に換算
    let income = parseInt(event.currentTarget.value) * 10000;
    // 正の整数以外は0に変換
    if (isNaN(income) || income < 0) {
      income = 0;
      setShownIncome("");
    } else {
      setShownIncome(income / 10000);
    }

    newHousehold.世帯員[personName].収入[currentDate] = income;
    setHousehold(newHousehold);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // 入力確定した際にページ遷移しないようにする
    if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  return (
    /*
    <div className="input-group input-group-lg mb-3">
      <span className="input-group-text">年収</span>
      <input
        name="年収"
        className="form-control"
        type="number"
        value={shownIncome}
        onChange={onChange}
      />
      <span className="input-group-text">万円</span>
    </div>
    */
    <>
      {mustInput && <ErrorMessage condition={shownIncome === ""} />}
      <HStack>
        <Box>年収</Box>
        {mustInput && (
          <Box color="red" fontSize="0.7em">
            必須
          </Box>
        )}
      </HStack>
      <HStack mb={4}>
        <Input
          type="number"
          value={shownIncome}
          onChange={onChange}
          onKeyDown={onKeyDown}
          width="10em"
        />
        <Box>万円</Box>
      </HStack>
    </>
  );
};

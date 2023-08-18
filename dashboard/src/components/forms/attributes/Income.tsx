import { KeyboardEvent, useCallback, useContext, useState } from "react";
import { Box, HStack, Input, FormControl, FormLabel } from "@chakra-ui/react";

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

    newHousehold.世帯員[personName].収入 = { [currentDate]: income };
    setHousehold(newHousehold);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // 入力確定した際にページ遷移しないようにする
    if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
      {mustInput && <ErrorMessage condition={shownIncome === ""} />}
      <FormControl>
        <FormLabel fontWeight="Regular">
          <HStack>
            <Box>年収</Box>
            {mustInput && (
              <Box color="red" fontSize="0.7em">
                必須
              </Box>
            )}
          </HStack>
        </FormLabel>

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
      </FormControl>
    </>
  );
};

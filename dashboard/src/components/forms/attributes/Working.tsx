import { useState, useCallback, useContext } from "react";
import { Checkbox } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const Working = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].六か月以内に新規就労 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].六か月以内に新規就労 = { [currentDate]: false };
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
        6か月以内に新しい仕事を始めた
      </Checkbox>
      <br></br>
    </>
  );
};

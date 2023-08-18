import { useState, useCallback, useContext } from "react";
import { Checkbox } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const NursingHome = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);

  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].介護施設入所中 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].介護施設入所中 = { [currentDate]: false };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox checked={isChecked} onChange={onChange} colorScheme="cyan" mb={4}>
        介護施設に入所している
      </Checkbox>
      <br />
    </>
  );
};

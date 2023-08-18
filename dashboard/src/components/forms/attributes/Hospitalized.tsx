import { useState, useCallback, useContext } from "react";
import { Checkbox } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const Hospitalized = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);

  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].入院中 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].入院中 = { [currentDate]: false };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox checked={isChecked} onChange={onChange} colorScheme="cyan" mb={2}>
        入院中
      </Checkbox>
      <br />
    </>
  );
};

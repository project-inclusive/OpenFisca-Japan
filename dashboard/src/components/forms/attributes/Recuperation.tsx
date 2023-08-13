import { useCallback, useContext, useState, useRef, useEffect } from "react";
import { Checkbox, Box } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";
import { HomeRecuperation } from "./HomeRecuperation";
import { NursingHome } from "./NursingHome";
import { Hospitalized } from "./Hospitalized";

export const Recuperation = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);

  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);

  const lastYearDate = `${new Date().getFullYear() - 1}-${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-01`;

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].在宅療養中 = { [currentDate]: false };
      newHousehold.世帯員[personName].入院中 = { [currentDate]: false };
      newHousehold.世帯員[personName].介護施設入所中 = { [currentDate]: false };
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onChange}>
        入院中／施設入所中／療養中である
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <HomeRecuperation personName={personName} />
            <NursingHome personName={personName} />
            <Hospitalized personName={personName} />
          </>
        </Box>
      )}
    </>
  );
};

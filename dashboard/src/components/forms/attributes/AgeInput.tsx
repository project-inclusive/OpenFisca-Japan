import { useState, useContext, useEffect } from "react";
import { Box, HStack, FormControl, FormLabel, Input } from "@chakra-ui/react";

import configData from "../../../config/app_config.json";
import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { ErrorMessage } from "./validation/ErrorMessage";

export const AgeInput = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const { household, setHousehold } = useContext(HouseholdContext);
  const [age, setAge] = useState("");

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => setAge(event.currentTarget.value);

  useEffect(() => {
    let birthday;
      if (!age) {
        birthday = "";
      } else {
        const today = new Date();
        const currentYear = today.getFullYear();
        const birthYear = currentYear - parseInt(age);

        birthday = `${birthYear.toString()}-01-01`;
      }

      const newHousehold = {
        ...household,
      };
      newHousehold.世帯員[personName]["誕生年月日"].ETERNITY = birthday;
      setHousehold(newHousehold);
  }, [age])

  return (
    <>
      {mustInput && (
        <ErrorMessage
          condition={
            !age
          }
        />
      )}
      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <HStack>
            <Box>年齢</Box>
            {mustInput && (
              <Box color="red" fontSize="0.7em">
                必須
              </Box>
            )}
          </HStack>
        </FormLabel>

        <HStack mb={4}>
          <Input
            width="6em"
            type="number"
            value={age}
            onChange={handleAgeChange}
          />
          <Box>歳</Box>          
        </HStack>
      </FormControl>
    </>
  );
};

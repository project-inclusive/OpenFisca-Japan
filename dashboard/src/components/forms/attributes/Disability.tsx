import { useState, useCallback, useContext, useEffect } from "react";
import { Checkbox, Box, HStack } from "@chakra-ui/react";

import { PhysicalDisability } from "./PhysicalDisability";
import { MentalDisability } from "./MentalDisability";
import { IntellectualDisability } from "./IntellectualDisability";
import { InternalDisability } from "./InternalDisability";
import { CerebralParalysis } from "./CerebralParalysis";
import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";
import { RadiationDamage } from "./RadiationDamage";

export const Disability = ({ personName }: { personName: string }) => {
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
      newHousehold.世帯員[personName].身体障害者手帳等級認定.ETERNITY = "無";
      newHousehold.世帯員[personName].療育手帳等級.ETERNITY = "無";
      newHousehold.世帯員[personName].愛の手帳等級.ETERNITY = "無";
      newHousehold.世帯員[personName].精神障害者保健福祉手帳等級.ETERNITY =
        "無";
      newHousehold.世帯員[personName].内部障害.ETERNITY = "無";
      newHousehold.世帯員[personName].脳性まひ_進行性筋萎縮症.ETERNITY = "無";
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onChange}>
        障害がある
      </Checkbox>
      {/*
        <input
          className="form-check-input"
          type="checkbox"
          checked={isChecked}
          id="flexCheckDefault"
          onChange={onChange}
        />*/}

      <Box mt={2} ml={4} mr={4} mb={4}>
        {isChecked && (
          <>
            <PhysicalDisability personName={personName} />
            <MentalDisability personName={personName} />
            <IntellectualDisability personName={personName} />
            <RadiationDamage personName={personName} />
            <InternalDisability personName={personName} />
            <CerebralParalysis personName={personName} />
          </>
        )}
      </Box>
    </>
  );
};

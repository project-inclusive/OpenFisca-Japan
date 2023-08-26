import { useState, useCallback, useContext } from "react";
import { Select, Checkbox, Box, FormControl, FormLabel } from "@chakra-ui/react";

import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const HighSchool = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // ラベルとOpenFiscaの表記違いを明記
  const highSchoolStatusArray = [
    ["", "無"],
    ["全日制課程", "全日制課程"],
    ["定時制課程", "定時制課程"],
    ["通信制課程", "通信制課程"],
    ["専攻科", "専攻科"],
  ];
  const [selectedStatus, setSelectedStatus] = useState("");

  // チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked) {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].高校種別 = {
          [currentDate]: "無",
        };
        setHousehold({ ...newHousehold });
        setSelectedStatus("");
      }
      setIsChecked(event.target.checked);
    },
    []
  );

  // コンボボックスの値が変更された時
  const onSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const highSchoolStatus = String(event.currentTarget.value);
      setSelectedStatus(highSchoolStatus);
      const newHousehold = { ...household };

      highSchoolStatusArray.map((item, index) => {
        if (
          item[0] === highSchoolStatus
        ) {
          newHousehold.世帯員[personName].高校種別 = {
            [currentDate]: item[1],
          };
        }
      });

      setHousehold({ ...newHousehold });
    },
    []
  );

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onCheckChange}>
        高校に通っている
      </Checkbox>

      {isChecked && (
        <FormControl>
          <FormLabel mt={2} ml={4} mr={4} mb={2} fontWeight="Regular">高校の種類</FormLabel>
          <Box mt={2} ml={4} mr={4} mb={4}>
            <Select
              value={selectedStatus}
              onChange={onSelectChange}
            >
              {highSchoolStatusArray.map((val, index) => (
                <option value={val[0]} key={index}>
                  {val[0]}
                </option>
              ))}
            </Select>
          </Box>
        </FormControl>

      )}
    </Box>
  );
};

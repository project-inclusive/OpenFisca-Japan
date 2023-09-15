import { useState, useContext } from 'react';
import { Select, Checkbox, Box, FormControl, FormLabel } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { CurrentDateContext } from '../../../contexts/CurrentDateContext';

export const HighSchool = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // ラベルとOpenFiscaの表記違いを明記
  const highSchoolStatusArray = ['全日制課程', '定時制課程', '通信制課程', '専攻科'];

  // チェックボックスの値が変更された時
  const onCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].高校種別 = {
        [currentDate]: highSchoolStatusArray[0],
      };
    } else {
      newHousehold.世帯員[personName].高校種別 = {
        [currentDate]: '無',
      };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  };

  // コンボボックスの値が変更された時
  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const highSchoolStatus = String(event.currentTarget.value);
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].高校種別 = {
      [currentDate]: highSchoolStatus,
    };
    setHousehold({ ...newHousehold });
  };

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onCheckChange}>
        高校に通っている
      </Checkbox>

      {isChecked && (
        <FormControl>
          <FormLabel mt={2} ml={4} mr={4} mb={2} fontWeight="Regular">
            高校の種類
          </FormLabel>
          <Box mt={2} ml={4} mr={4} mb={4}>
            <Select onChange={onSelectChange}>
              {highSchoolStatusArray.map((val, index) => (
                <option value={val} key={index}>
                  {val}
                </option>
              ))}
            </Select>
          </Box>
        </FormControl>
      )}
    </Box>
  );
};

import { useState, useCallback, useContext } from 'react';
import {
  Select,
  Checkbox,
  Box,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { currentDateAtom } from '../../../state';
import { useRecoilValue } from 'recoil';

export const HighSchool = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // ラベルとOpenFiscaの表記違いを明記
  const highSchoolCourseStatusArray = [
    '全日制課程',
    '定時制課程',
    '通信制課程',
    '専攻科',
  ];

  const highSchoolManagementStatusArray = ['国立', '公立', '私立'];

  // チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newHousehold = { ...household };
      if (event.target.checked) {
        newHousehold.世帯員[personName].高校履修種別 = {
          [currentDate]: highSchoolCourseStatusArray[0],
        };
        newHousehold.世帯員[personName].高校運営種別 = {
          [currentDate]: highSchoolManagementStatusArray[0],
        };
      } else {
        newHousehold.世帯員[personName].高校履修種別 = {
          [currentDate]: '無',
        };
        newHousehold.世帯員[personName].高校運営種別 = {
          [currentDate]: '無',
        };
      }
      setHousehold({ ...newHousehold });
      setIsChecked(event.target.checked);
    },
    []
  );

  // 高校履修種別コンボボックスの値が変更された時
  const onhighSchoolCourseSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const highSchoolCourseStatus = String(event.currentTarget.value);
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].高校履修種別 = {
        [currentDate]: highSchoolCourseStatus,
      };
      setHousehold({ ...newHousehold });
    },
    []
  );

  // 高校運営種別コンボボックスの値が変更された時
  const onhighSchoolManagementSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const highSchoolManagementStatus = String(event.currentTarget.value);
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].高校運営種別 = {
        [currentDate]: highSchoolManagementStatus,
      };
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
          <FormLabel mt={2} ml={4} mr={4} mb={2} fontWeight="Regular">
            高校の種類
          </FormLabel>
          <HStack mt={2} ml={4} mr={4} mb={2}>
            <Select onChange={onhighSchoolCourseSelectChange}>
              {highSchoolCourseStatusArray.map((val, index) => (
                <option value={val} key={index}>
                  {val}
                </option>
              ))}
            </Select>
            <Select onChange={onhighSchoolManagementSelectChange}>
              {highSchoolManagementStatusArray.map((val, index) => (
                <option value={val} key={index}>
                  {val}
                </option>
              ))}
            </Select>
          </HStack>
        </FormControl>
      )}
    </Box>
  );
};

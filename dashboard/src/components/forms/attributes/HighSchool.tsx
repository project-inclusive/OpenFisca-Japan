import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import {
  Select,
  Checkbox,
  Box,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';

import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';

export const HighSchool = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // ラベルとOpenFiscaの表記違いを明記
  const highSchoolCourseStatusArray = [
    '全日制課程',
    '定時制課程',
    '通信制課程',
    '専攻科',
  ];
  const [highSchoolCourseStatus, setHighSchoolCourseStatus] = useState('');
  const highSchoolManagementStatusArray = ['国立', '公立', '私立'];
  const [highSchoolManagementStatus, setHighSchoolManagementStatus] =
    useState('');

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
        setHighSchoolCourseStatus(highSchoolCourseStatusArray[0]);
        setHighSchoolManagementStatus(highSchoolManagementStatusArray[0]);
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
  const onHighSchoolCourseSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const changedCourseStatus = String(event.currentTarget.value);
      setHighSchoolCourseStatus(changedCourseStatus);
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].高校履修種別 = {
        [currentDate]: changedCourseStatus,
      };
      setHousehold({ ...newHousehold });
    },
    []
  );

  // 高校運営種別コンボボックスの値が変更された時
  const onHighSchoolManagementSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const changedManagementStatus = String(event.currentTarget.value);
      setHighSchoolManagementStatus(changedManagementStatus);
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].高校運営種別 = {
        [currentDate]: changedManagementStatus,
      };
      setHousehold({ ...newHousehold });
    },
    []
  );

  // stored states set value when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    if (
      (personObj.高校履修種別 &&
        personObj.高校履修種別[currentDate] !== '無') ||
      (personObj.高校運営種別 && personObj.高校運営種別[currentDate] !== '無')
    ) {
      setIsChecked(true);
    }

    if (personObj.高校履修種別) {
      setHighSchoolCourseStatus(personObj.高校履修種別[currentDate]);
    }

    if (personObj.高校運営種別) {
      setHighSchoolManagementStatus(personObj.高校運営種別[currentDate]);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onCheckChange}
      >
        高校に通っている
      </Checkbox>

      {isChecked && (
        <FormControl>
          <FormLabel mt={2} ml={4} mr={4} mb={2} fontWeight="Regular">
            高校の種類
          </FormLabel>
          <HStack mt={2} ml={4} mr={4} mb={2}>
            <Select
              value={highSchoolCourseStatus}
              onChange={onHighSchoolCourseSelectChange}
            >
              {highSchoolCourseStatusArray.map((val, index) => (
                <option value={val} key={index}>
                  {val}
                </option>
              ))}
            </Select>
            <Select
              value={highSchoolManagementStatus}
              onChange={onHighSchoolManagementSelectChange}
            >
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

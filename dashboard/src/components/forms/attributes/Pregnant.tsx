import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Select, Checkbox, Box } from '@chakra-ui/react';

import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';

export const Pregnant = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // ラベルとOpenFiscaの表記違いを明記
  const pregnantStatusArray = [
    '妊娠6ヵ月未満',
    '妊娠6ヵ月以上',
    '産後6ヵ月以内',
  ];
  const [pregnantStatus, setPregnantStatus] = useState('');

  // チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked) {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].妊産婦 = {
          [currentDate]: '無',
        };
        setHousehold({ ...newHousehold });
        setPregnantStatus('');
      }
      setIsChecked(event.target.checked);
    },
    []
  );

  // コンボボックスの値が変更された時
  const onSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const inputVal = String(event.currentTarget.value);
      setPregnantStatus(inputVal);
      const newHousehold = { ...household };
      if (inputVal) {
        newHousehold.世帯員[personName].妊産婦 = {
          [currentDate]: inputVal,
        };
      } else {
        newHousehold.世帯員[personName].妊産婦 = {
          [currentDate]: '無',
        };
      }

      setHousehold({ ...newHousehold });
    },
    []
  );

  // stored states set value when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    if (personObj.妊産婦 && personObj.妊産婦[currentDate] !== '無') {
      setIsChecked(true);
    }

    if (personObj.妊産婦) {
      setPregnantStatus(personObj.妊産婦[currentDate]);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onCheckChange}
      >
        自分または配偶者が妊娠中あるいは産後6ヵ月以内
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <Select
            value={pregnantStatus}
            onChange={onSelectChange}
            placeholder="いずれかを選択"
          >
            {pregnantStatusArray.map((val, index) => (
              <option value={val} key={index}>
                {val}
              </option>
            ))}
          </Select>
        </Box>
      )}
    </Box>
  );
};

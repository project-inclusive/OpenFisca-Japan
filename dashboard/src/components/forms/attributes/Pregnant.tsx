import { useState, useCallback } from 'react';
import { Select, Checkbox, Box } from '@chakra-ui/react';

import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';

export const Pregnant = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // ラベルとOpenFiscaの表記違いを明記
  const pregnantStatusArray = [
    '妊娠6ヵ月未満',
    '妊娠6ヵ月以上',
    '産後6ヵ月以内',
  ];

  // チェックボックスの値が変更された時
  const onCheckChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked) {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].妊産婦 = {
          [currentDate]: '無',
        };
        setHousehold({ ...newHousehold });
      }
      setIsChecked(event.target.checked);
    },
    []
  );

  // コンボボックスの値が変更された時
  const onSelectChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const pregnantStatus = String(event.currentTarget.value);
      const newHousehold = { ...household };
      if (pregnantStatus) {
        newHousehold.世帯員[personName].妊産婦 = {
          [currentDate]: pregnantStatus,
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

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onCheckChange}>
        自分または配偶者が妊娠中あるいは産後6ヵ月以内
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <Select onChange={onSelectChange} placeholder="いずれかを選択">
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

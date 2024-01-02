import { useCallback, useState } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';

export const SpouseExists = () => {
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);
  const spouseName = '配偶者';

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      if (newHousehold.世帯一覧.世帯1.親一覧.length == 1) {
        newHousehold.世帯員[spouseName] = {};
        newHousehold.世帯一覧.世帯1.親一覧.push(spouseName);
      }
    } else {
      delete newHousehold.世帯員[spouseName];
      const spouseIdx = newHousehold.世帯一覧.世帯1.親一覧.indexOf(spouseName);
      newHousehold.世帯一覧.世帯1.親一覧.splice(spouseIdx, 1);
      newHousehold.世帯一覧.世帯1.配偶者がいるがひとり親に該当 = {
        [currentDate]: false,
      };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        checked={isChecked}
        onChange={onChange}
        mb={4}
      >
        配偶者がいる（事実婚の場合も含む）
      </Checkbox>
      <br></br>
    </>
  );
};

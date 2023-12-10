import { useCallback, useContext, useState } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { currentDateAtom } from '../../../state';
import { useRecoilValue } from 'recoil';

export const SpouseExists = () => {
  const currentDate = useRecoilValue(currentDateAtom);
  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);
  const spouseName = '配偶者';

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[spouseName] = {};
      newHousehold.世帯一覧.世帯1.配偶者一覧 = [spouseName];
    } else {
      delete newHousehold.世帯員[spouseName];
      delete newHousehold.世帯一覧.世帯1.配偶者一覧;
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

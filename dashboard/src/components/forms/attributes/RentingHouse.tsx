import { useState, useCallback, useContext } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { CurrentDateContext } from '../../../contexts/CurrentDateContext';

export const RentingHouse = () => {
  const currentDate = useContext(CurrentDateContext);
  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      // レスポンスとして住宅入居費を受け取るため、空オブジェクトを設定
      newHousehold.世帯.世帯1.住宅入居費 = { [currentDate]: null };
    } else {
      delete newHousehold.世帯.世帯1.住宅入居費;
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox colorScheme="cyan" checked={isChecked} onChange={onChange} mb={4}>
        家を借りたい
      </Checkbox>
      <br></br>
    </>
  );
};

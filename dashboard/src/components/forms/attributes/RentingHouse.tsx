import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const RentingHouse = () => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      // レスポンスとして住宅入居費を受け取るため、空オブジェクトを設定
      newHousehold.世帯一覧.世帯1.住宅入居費 = { [currentDate]: null };
    } else {
      delete newHousehold.世帯一覧.世帯1.住宅入居費;
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    setIsChecked(household.世帯一覧.世帯1.住宅入居費);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onChange}
        mb={4}
      >
        家を借りたい
      </Checkbox>
      <br></br>
    </>
  );
};

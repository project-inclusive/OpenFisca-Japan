// Von Willebrand（フォン・ヴィルブランド）病

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../../state';

export const VonWillebrand = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].血液凝固因子異常症種別 = {
        [currentDate]: 'フォンヴィルブランド病',
      };
    } else {
      newHousehold.世帯員[personName].血液凝固因子異常症種別 = {
        [currentDate]: '',
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const vonWillebrandObj =
      household.世帯員[personName].血液凝固因子異常症種別;
    setIsChecked(
      vonWillebrandObj &&
        vonWillebrandObj[currentDate] === 'フォンヴィルブランド病'
    );
  }, [navigationType]);

  return (
    <>
      <Checkbox
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        Von Willebrand（フォン・ヴィルブランド）病
      </Checkbox>
      <br />
    </>
  );
};

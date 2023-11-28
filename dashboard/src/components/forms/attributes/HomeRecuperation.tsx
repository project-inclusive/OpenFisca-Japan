import { useState, useCallback, useContext } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { useRecoilValue } from 'recoil';
import { currentDateAtom } from '../../../state';

export const HomeRecuperation = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);

  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].在宅療養中 = { [currentDate]: true };
    } else {
      newHousehold.世帯員[personName].在宅療養中 = { [currentDate]: false };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Checkbox
        checked={isChecked}
        onChange={onChange}
        colorScheme="cyan"
        mb={2}
      >
        在宅療養中（結核、または治療に3か月以上かかるもの）
      </Checkbox>
      <br />
    </>
  );
};

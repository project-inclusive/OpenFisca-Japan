import { useState, useCallback } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { currentDateAtom, householdAtom } from '../../../state';
import { useRecoilState, useRecoilValue } from 'recoil';

export const InternalDisability = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].内部障害 = {
        [currentDate]: '有',
      };
    } else {
      newHousehold.世帯員[personName].内部障害 = {
        [currentDate]: '無',
      };
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
        内部障害がある
      </Checkbox>
      <br></br>
    </>
  );
};

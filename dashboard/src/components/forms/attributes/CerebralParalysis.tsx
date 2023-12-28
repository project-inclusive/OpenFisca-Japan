import { useState, useCallback } from 'react';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const CerebralParalysis = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].脳性まひ_進行性筋萎縮症 = {
        [currentDate]: '有',
      };
    } else {
      newHousehold.世帯員[personName].脳性まひ_進行性筋萎縮症 = {
        [currentDate]: '無',
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <Checkbox checked={isChecked} onChange={onChange} colorScheme="cyan" mb={2}>
      脳性まひ・進行性筋萎縮症
    </Checkbox>
  );
};

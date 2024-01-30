import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';
import { useRecoilValue, useRecoilState } from 'recoil';

import { currentDateAtom, householdAtom } from '../../../state';

export const DisasterDisability = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].災害による重い後遺障害がある = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].災害による重い後遺障害がある = {
        [currentDate]: false,
      };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set displayed value when page transition
  useEffect(() => {
    const disasterDisabilityObj =
      household.世帯員[personName].災害による重い後遺障害がある;
    setIsChecked(disasterDisabilityObj && disasterDisabilityObj[currentDate]);
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        災害による精神または身体の重い障害がある
      </Checkbox>
    </Box>
  );
};

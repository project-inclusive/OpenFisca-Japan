import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const LeaveOfAbsenseByInjury = ({
  personName,
}: {
  personName: string;
}) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [household, setHousehold] = useRecoilState(householdAtom);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].けがによって連続三日以上休業している = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].けがによって連続三日以上休業している = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const LeaveOfAbsenseByInjuryObj =
      household.世帯員[personName].けがによって連続三日以上休業している;
    setIsChecked(
      LeaveOfAbsenseByInjuryObj && LeaveOfAbsenseByInjuryObj[currentDate]
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
        けがによって連続三日以上休業している
      </Checkbox>
      <br />
    </>
  );
};

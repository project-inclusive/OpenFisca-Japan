import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const IndustrialAccidentDisease = ({
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
      newHousehold.世帯員[personName].業務によって病気になった = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯員[personName].業務によって病気になった = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const IndustrialAccidentDiseaseObj =
      household.世帯員[personName].業務によって病気になった;
    setIsChecked(
      IndustrialAccidentDiseaseObj && IndustrialAccidentDiseaseObj[currentDate]
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
        業務によって病気になった
      </Checkbox>
      <br />
    </>
  );
};

import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox } from '@chakra-ui/react';

import { useRecoilState } from 'recoil';
import { frontendHouseholdAtom } from '../../../state';

export const DifficultyItem = ({ description }: { description: string }) => {
  const navigationType = useNavigationType();
  const [isChecked, setIsChecked] = useState(false);
  const [frontendHousehold, setfrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newFrontendHousehold = { ...frontendHousehold };
    newFrontendHousehold.difficulty[description] = event.target.checked;

    setfrontendHousehold({ ...newFrontendHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    setIsChecked(frontendHousehold.difficulty[description]);
  }, [navigationType]);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onChange}
        mb={4}
      >
        {description}
      </Checkbox>
      <br></br>
    </>
  );
};

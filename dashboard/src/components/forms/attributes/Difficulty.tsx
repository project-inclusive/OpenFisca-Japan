import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Box, Checkbox } from '@chakra-ui/react';

import { useRecoilState } from 'recoil';
import { frontendHouseholdAtom } from '../../../state';
import { DifficultyItem } from './DifficultyItem';

export const Difficulty = () => {
  const navigationType = useNavigationType();
  const [isChecked, setIsChecked] = useState(false);
  const [frontendHousehold, setfrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // チェックを外したときは、子要素のチェックをすべて外す
    if (!event.target.checked) {
      const newFrontendHousehold = { ...frontendHousehold };
      for (const key in frontendHousehold.困りごと) {
        newFrontendHousehold.困りごと[key] = false;
      }

      setfrontendHousehold({ ...newFrontendHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    // 1つでもチェックされていたら全体にもチェックを入れ展開する
    if (Object.values(frontendHousehold.困りごと).some((value) => value)) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <>
      <Checkbox
        colorScheme="cyan"
        isChecked={isChecked}
        onChange={onChange}
        mb={4}
      >
        困りごとがある
      </Checkbox>
      <Box ml={4} mr={4} mb={4}>
        <>
          {isChecked &&
            Object.keys(frontendHousehold.困りごと).map(
              (key: string, index: number) => (
                <DifficultyItem key={index} description={key} />
              )
            )}
        </>
      </Box>
      <br></br>
    </>
  );
};

// Hemophilia（血友病）

import { useCallback, useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, Box } from '@chakra-ui/react';

import { Factor1 } from './sub/Factor1';
import { Factor2 } from './sub/Factor2';
import { Factor5 } from './sub/Factor5';
import { Factor7 } from './sub/Factor7';
import { Factor8 } from './sub/Factor8';
import { Factor9 } from './sub/Factor9';
import { Factor10 } from './sub/Factor10';
import { Factor11 } from './sub/Factor11';
import { Factor12 } from './sub/Factor12';
import { Factor13 } from './sub/Factor13';
import { VonWillebrand } from './sub/VonWillebrand';
import { Other } from './sub/Other';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../../state';

export const Hemophilia = ({ personName }: { personName: string }) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);

  const [isChecked, setIsChecked] = useState(false);
  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].第I因子欠乏症 = { [currentDate]: false };
      newHousehold.世帯員[personName].第II因子欠乏症 = { [currentDate]: false };
      newHousehold.世帯員[personName].第V因子欠乏症 = { [currentDate]: false };
      newHousehold.世帯員[personName].第VII因子欠乏症 = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].第VIII因子欠乏症 = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].第IX因子欠乏症 = { [currentDate]: false };
      newHousehold.世帯員[personName].第X因子欠乏症 = { [currentDate]: false };
      newHousehold.世帯員[personName].第XI因子欠乏症 = { [currentDate]: false };
      newHousehold.世帯員[personName].第XII因子欠乏症 = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].第XIII因子欠乏症 = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].フォンヴィルブランド病 = {
        [currentDate]: false,
      };
      newHousehold.世帯員[personName].その他 = { [currentDate]: false };
      setHousehold({ ...newHousehold });
    }

    setIsChecked(event.target.checked);
  }, []);

  // stored states set value when page transition
  useEffect(() => {
    const personObj = household.世帯員[personName];
    if (
      (personObj.第I因子欠乏症 &&
        personObj.第I因子欠乏症[currentDate] !== false) ||
      (personObj.第II因子欠乏症 &&
        personObj.第II因子欠乏症[currentDate] !== false) ||
      (personObj.第V因子欠乏症 &&
        personObj.第V因子欠乏症[currentDate] !== false) ||
      (personObj.第VII因子欠乏症 &&
        personObj.第VII因子欠乏症[currentDate] !== false) ||
      (personObj.第VIII因子欠乏症 &&
        personObj.第VIII因子欠乏症[currentDate] !== false) ||
      (personObj.第IX因子欠乏症 &&
        personObj.第IX因子欠乏症[currentDate] !== false) ||
      (personObj.第X因子欠乏症 &&
        personObj.第X因子欠乏症[currentDate] !== false) ||
      (personObj.第XI因子欠乏症 &&
        personObj.第XI因子欠乏症[currentDate] !== false) ||
      (personObj.第XII因子欠乏症 &&
        personObj.第XII因子欠乏症[currentDate] !== false) ||
      (personObj.第XIII因子欠乏症 &&
        personObj.第XIII因子欠乏症[currentDate] !== false) ||
      (personObj.フォンヴィルブランド病 &&
        personObj.フォンヴィルブランド病[currentDate] !== false) ||
      (personObj.その他 && personObj.その他[currentDate] !== false)
    ) {
      setIsChecked(true);
    }
  }, [navigationType]);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        先天性の血液凝固因子異常症(血友病等)である
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <Factor1 personName={personName} />
            <Factor2 personName={personName} />
            <Factor5 personName={personName} />
            <Factor7 personName={personName} />
            <Factor8 personName={personName} />
            <Factor9 personName={personName} />
            <Factor10 personName={personName} />
            <Factor11 personName={personName} />
            <Factor12 personName={personName} />
            <Factor13 personName={personName} />
            <VonWillebrand personName={personName} />
            <Other personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};

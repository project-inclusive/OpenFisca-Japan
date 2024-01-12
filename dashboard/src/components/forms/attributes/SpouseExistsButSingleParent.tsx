import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Checkbox, UnorderedList, ListItem } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const SpouseExistsButSingleParent = ({
  personName,
}: {
  personName: string;
}) => {
  const navigationType = useNavigationType();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isChecked, setIsChecked] = useState(false);

  const [household, setHousehold] = useRecoilState(householdAtom);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };

    if (event.target.checked) {
      newHousehold.世帯一覧.世帯1.配偶者がいるがひとり親に該当 = {
        [currentDate]: true,
      };
    } else {
      newHousehold.世帯一覧.世帯1.配偶者がいるがひとり親に該当 = {
        [currentDate]: false,
      };
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  // stored states set checkbox when page transition
  useEffect(() => {
    const targetObj = household.世帯一覧.世帯1.配偶者がいるがひとり親に該当;
    setIsChecked(targetObj && targetObj[currentDate]);
  }, [navigationType]);

  return (
    <>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        以下のいずれかに当てはまる
      </Checkbox>
      <UnorderedList ml={8} mt={1}>
        <ul>
          <ListItem>重度の障害がある</ListItem>
          <ListItem>生死が不明</ListItem>
          <ListItem>子を1年以上遺棄している</ListItem>
          <ListItem>裁判所からのDV保護命令を受けた</ListItem>
          <ListItem>法令により1年以上拘禁されている</ListItem>
        </ul>
        <br></br>
      </UnorderedList>
    </>
  );
};

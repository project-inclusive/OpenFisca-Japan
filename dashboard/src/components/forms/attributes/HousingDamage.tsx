import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Select, FormControl, FormLabel } from '@chakra-ui/react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';

export const HousingDamage = () => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  // ラベルとOpenFiscaの表記違いを明記(pythonは数字を頭にした変数名をつけられない)
  const items = [
    ['', '無'],
    ['中規模半壊（損害割合30%台）', '中規模半壊'],
    ['大規模半壊（損害割合40%台）', '大規模半壊'],
    ['全壊（損害割合50%以上）', '全壊'],
    ['長期避難', '長期避難'],
    ['解体', '解体'],
    ['滅失または流失', '滅失または流失'],
  ];
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // コンボボックスの値が変更された時
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedItemIndex(parseInt(event.currentTarget.value));
      const newHousehold = { ...household };
      newHousehold.世帯一覧.世帯1.住宅被害 = {
        [currentDate]: items[parseInt(event.currentTarget.value)][1],
      };
      setHousehold({ ...newHousehold });
    },
    []
  );

  // 「あなた」の「子どもの数」が変更されたときに全ての子どもの身体障害者手帳等級が「無」に
  // リセットされるため、コンボボックスも「なし」に戻す
  // stored states set displayed value when page transition
  useEffect(() => {
    if (household.世帯員[personName].身体障害者手帳等級) {
      items.map((item, index) => {
        if (
          item[1] ===
          household.世帯員[personName].身体障害者手帳等級[currentDate]
        ) {
          setSelectedItemIndex(index);
        }
      });
    }
  }, [navigationType, household.世帯員[personName].身体障害者手帳等級]);

  return (
    <>
      <FormControl>
        <FormLabel fontWeight="Regular">身体障害者手帳</FormLabel>
        <Select
          value={selectedItemIndex}
          className="form-select"
          onChange={onChange}
          mb={3}
        >
          {items.map((item, index) => (
            <option value={index} key={index}>
              {item[0]}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

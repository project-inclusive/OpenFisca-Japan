import { useState, useCallback, useContext, useEffect } from 'react';
import { Select, FormControl, FormLabel } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { CurrentDateContext } from '../../../contexts/CurrentDateContext';

export const MentalDisability = ({ personName }: { personName: string }) => {
  const { household, setHousehold } = useContext(HouseholdContext);
  const currentDate = useContext(CurrentDateContext);

  // ラベルとOpenFiscaの表記違いを明記(pythonは数字を頭にした変数名をつけられない)
  const items = [
    ['', '無'],
    ['1級', '一級'],
    ['2級', '二級'],
    ['3級', '三級'],
  ];
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // コンボボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItemIndex(parseInt(event.currentTarget.value));
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].精神障害者保健福祉手帳等級 = {
      [currentDate]: items[parseInt(event.currentTarget.value)][1],
    };
    setHousehold({ ...newHousehold });
  }, []);

  // 「あなた」の「子どもの数」が変更されたときに全ての子どもの精神障害者保健福祉手帳等級が「無」に
  // リセットされるため、コンボボックスも空白に戻す
  useEffect(() => {
    if (household.世帯員[personName].精神障害者保健福祉手帳等級) {
      items.map((item, index) => {
        if (item[1] === household.世帯員[personName].精神障害者保健福祉手帳等級[currentDate]) {
          setSelectedItemIndex(index);
        }
      });
    }
  }, [household.世帯員[personName].精神障害者保健福祉手帳等級]);

  return (
    <>
      <FormControl>
        <FormLabel fontWeight="Regular">精神障害者保健福祉手帳</FormLabel>

        <Select value={selectedItemIndex} className="form-select" onChange={onChange} mb={3}>
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

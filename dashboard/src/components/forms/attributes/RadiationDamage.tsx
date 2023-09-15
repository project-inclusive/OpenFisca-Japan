import { useState, useContext, useEffect } from 'react';
import { Select, FormControl, FormLabel } from '@chakra-ui/react';

import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { CurrentDateContext } from '../../../contexts/CurrentDateContext';

export const RadiationDamage = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);

  // ラベルとOpenFiscaの表記違いを明記
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = [
    ['', '無'],
    ['現罹患者', '現罹患者'],
    ['元罹患者', '元罹患者'],
  ];
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // コンボボックスの値が変更された時
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItemIndex(parseInt(event.currentTarget.value));
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].放射線障害 = { [currentDate]: items[parseInt(event.currentTarget.value)][1] };
    setHousehold({ ...newHousehold });
  };

  // 「あなた」の「子どもの数」が変更されたときに全ての子どもの放射線障害が「無」に
  // リセットされるため、コンボボックスも空白に戻す
  useEffect(() => {
    if (household.世帯員[personName].放射線障害) {
      items.map((item, index) => {
        const { currentDate: value } = household.世帯員[personName].放射線障害;
        if (item[1] === value) {
          setSelectedItemIndex(index);
        }
      });
    }
  }, [household.世帯員, items, personName]);

  return (
    <>
      <FormControl>
        <FormLabel fontWeight="Regular">放射線障害</FormLabel>

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

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const HousingDamageQuestion = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const items = [
    { key: '滅失または流失', value: '滅失または流失' },
    { key: '長期避難', value: '長期避難' },
    { key: '解体', value: '解体' },
    { key: '全壊（損害割合50%以上）', value: '全壊' },
    { key: '大規模半壊（損害割合40%台）', value: '大規模半壊' },
    { key: '中規模半壊（損害割合30%台）', value: '中規模半壊' },
  ];
  const keyMap = Object.fromEntries(
    items.map((item) => [item.key, item.value])
  );

  const selections = items.map((item: { key: string; value: string }) => {
    return {
      selection: item.key,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯一覧.世帯1.住宅被害 = {
          [currentDate]: item.value,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return (
    <SelectionQuestion
      title="住宅被害の状況（当てはまるもののうち最も上のものを選んでください）"
      selections={selections}
    />
  );
};

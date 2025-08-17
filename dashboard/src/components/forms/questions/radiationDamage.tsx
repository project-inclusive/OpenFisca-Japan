import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const RadiationDamage = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  // display: 画面表示に使用
  // value: OpenFisca APIに使用
  const items = [
    { display: '現罹患者', value: '現罹患者' },
    { display: '元罹患者', value: '元罹患者' },
    { display: 'いいえ', value: '無' },
  ];

  const selections = items.map((item) => {
    return {
      selection: item.display,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].放射線障害 = {
          [currentDate]: item.value,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return (
    <SelectionQuestion
      title="放射線障害がありますか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].放射線障害
          ? items.find(
              (item) =>
                item.value ===
                household.世帯員[personName].放射線障害[currentDate]
            )?.display ?? null
          : null
      }
    />
  );
};

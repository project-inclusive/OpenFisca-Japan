import { useRecoilState, useRecoilValue } from "recoil";
import { currentDateAtom, householdAtom } from "../../../state";
import { SelectionQuestion } from "../templates/selectionQuestion";

export const IntellectualDisability = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  // display: 画面表示に使用
  // value: OpenFisca APIに使用
  // householdKey: householdオブジェクトに追加するキー
  const items = [
    { display: '療育手帳 A', value: 'A', householdKey: '療育手帳等級' },
    { display: '療育手帳 B', value: 'B', householdKey: '療育手帳等級' },
    { display: '愛の手帳 1度', value: '一度', householdKey: '愛の手帳等級' },
    { display: '愛の手帳 2度', value: '二度', householdKey: '愛の手帳等級' },
    { display: '愛の手帳 3度', value: '三度', householdKey: '愛の手帳等級' },
    { display: '愛の手帳 4度', value: '四度', householdKey: '愛の手帳等級' },
    { display: '上記以外／持っていない', value: '無', householdKey: '療育手帳等級' },
  ];

  const selections = items.map((item) => {
    return {
      selection: item.display,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName][item.householdKey] = {
          [currentDate]: item.value,
        };

        if (item.householdKey === '療育手帳等級') {
          delete newHousehold.世帯員[personName].愛の手帳等級
        }
        if (item.householdKey === '愛の手帳等級') {
          delete newHousehold.世帯員[personName].療育手帳等級
        }
        setHousehold({ ...newHousehold });
      }
    }
  });

  return (
    <SelectionQuestion
      title="療育手帳、または愛の手帳を持っていますか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) => {
        const item = items.find((item) => {
          const value = household.世帯員[personName][item.householdKey]
            ? household.世帯員[personName][item.householdKey][currentDate]
            : null
          return item.value === value
        });
        return item?.display ?? null;
      }}
    />
  )
};
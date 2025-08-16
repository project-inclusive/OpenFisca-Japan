import { useRecoilState, useRecoilValue } from "recoil";
import { currentDateAtom, householdAtom } from "../../../state";
import { SelectionQuestion } from "../templates/selectionQuestion";

export const SelfIntellectualDisability = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const items = [
    { display: '療育手帳 A', value: 'A' },
    { display: '療育手帳 B', value: 'B' },
    { display: '愛の手帳 1度', value: '一度' },
    { display: '愛の手帳 2度', value: '二度' },
    { display: '愛の手帳 3度', value: '三度' },
    { display: '愛の手帳 4度', value: '四度' },
    { display: '上記以外／持っていない', value: '無' },
  ];

  const selections = items.map((item) => {
    return {
      selection: item.display,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員['あなた'].愛の手帳等級 = { // TODO: 選択項目に応じて「愛の手帳 or 療育手帳」を切り替えるようにする
          [currentDate]: item.value,
        };
        setHousehold({ ...newHousehold });
      }
    }
  });

  return (
    <SelectionQuestion
      title="療育手帳、または愛の手帳を持っていますか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員['あなた'].身体障害者手帳等級
          ? household.世帯員['あなた'].身体障害者手帳等級[currentDate]
          : null
      }
    />
  )
};

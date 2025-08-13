import { useRecoilState, useRecoilValue } from "recoil";
import { currentDateAtom, householdAtom } from "../../../state";
import { SelectionQuestion } from "../templates/selectionQuestion";

export const ChildPhysicalDisability = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const grades = ['1級', '2級', '3級', '上記以外／持っていない'];

  const selections = grades.map((grade: string) => {
    return {
      selection: grade,
      onClick: () => {
        const newHousehold = { ...household };
        // TODO: 子どものサフィックスはpersonNumから取得するように修正
        newHousehold.世帯員['子ども1'].身体障害者手帳等級 = {
          [currentDate]: grade,
        };
        setHousehold({ ...newHousehold });
      }
    }
  });

  return (
    <SelectionQuestion
      title="身体障害者手帳を持っていま身体障害者手帳等級すか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員['子ども1'].身体障害者手帳等級 // TODO: 子どものサフィックスはpersonNumから取得するように修正
          ? household.世帯員['子ども1'].身体障害者手帳等級[currentDate]
          : null
      }
    />
  );
}
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const PhysicalDisability = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  // display: 画面表示に使用
  // value: OpenFisca APIに使用(pythonは数字を頭にした変数名をつけられない)
  const grades = [
    { display: '1級', value: '一級' },
    { display: '2級', value: '二級' },
    { display: '3級', value: '三級' },
    { display: '上記以外／持っていない', value: '無' },
  ];

  const selections = grades.map((grade) => {
    return {
      selection: grade.display,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].身体障害者手帳等級 = {
          [currentDate]: grade.value,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return (
    <SelectionQuestion
      title="身体障害者手帳を持っていますか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].身体障害者手帳等級
          ? household.世帯員[personName].身体障害者手帳等級[currentDate]
          : null
      }
    />
  );
};

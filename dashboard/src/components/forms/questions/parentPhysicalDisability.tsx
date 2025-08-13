import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom, questionKeyAtom  } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const ParentPhysicalDisability = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);
  const questionKey = useRecoilValue(questionKeyAtom);

  const grades = ['1級', '2級', '3級', '上記以外／持っていない'];

  const selections = grades.map((grade: string) => {
    return {
      selection: grade,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[`親${questionKey.personNum}`].身体障害者手帳等級 = {
          [currentDate]: grade,
        };
        setHousehold({ ...newHousehold });
      }
    };
  });

  return (
    <SelectionQuestion
      title="身体障害者手帳を持っていますか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[`親${questionKey.personNum}`].身体障害者手帳等級
          ? household.世帯員[`親${questionKey.personNum}`].身体障害者手帳等級[currentDate]
          : null
      }
    />
  );
};
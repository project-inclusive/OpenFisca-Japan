import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const OccupationQuestion = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const occupations = ['会社員', '公務員', '自営業', 'その他'];

  const selections = occupations.map((occupation: string) => {
    return {
      selection: occupation,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].就労形態 = {
          [currentDate]: occupation,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return <SelectionQuestion title="仕事" selections={selections} />;
};

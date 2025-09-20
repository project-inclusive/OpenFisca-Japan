import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentDateAtom,
  householdAtom,
  questionKeyAtom,
} from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const ChildHighSchoolManagement = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const questionKey = useRecoilValue(questionKeyAtom);
  const personName = `子ども${questionKey.personNum}`;

  // display: 画面表示に使用
  // value: OpenFisca APIに使用
  const kinds = ['国立', '公立', '私立'];

  const selections = kinds.map((kind) => {
    return {
      selection: kind,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].高校運営種別 = {
          [currentDate]: kind,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return (
    <SelectionQuestion
      title="通っている高校の種類を選んでください（2）"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].高校運営種別
          ? household.世帯員[personName].高校運営種別[currentDate]
          : null
      }
    />
  );
};

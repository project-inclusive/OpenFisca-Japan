import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentDateAtom,
  householdAtom,
  questionKeyAtom,
} from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const ChildHighSchoolCourse = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const questionKey = useRecoilValue(questionKeyAtom);
  const personName = `子ども${questionKey.personNum}`;

  // display: 画面表示に使用
  // value: OpenFisca APIに使用
  const kinds = ['全日制課程', '定時制課程', '通信制課程', '専攻科'];

  const selections = kinds.map((kind) => {
    return {
      selection: kind,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].高校履修種別 = {
          [currentDate]: kind,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return (
    <SelectionQuestion
      title="通っている高校の種類を選んでください（1）"
      selections={selections}
    />
  );
};

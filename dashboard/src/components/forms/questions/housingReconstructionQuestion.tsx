import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const HousingReconstructionQuestion = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);
  const items = ['建設または購入', '補修', '賃借'];

  const selections = items.map((item: string) => {
    return {
      selection: item,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯一覧.世帯1.住宅再建方法 = {
          [currentDate]: item,
        };
        newHousehold.世帯一覧.世帯1.災害救助法の適用地域である = {
          [currentDate]: true,
        };
        newHousehold.世帯一覧.世帯1.被災者生活再建支援法の適用地域である = {
          [currentDate]: true,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return <SelectionQuestion title="住宅再建方法" selections={selections} />;
};

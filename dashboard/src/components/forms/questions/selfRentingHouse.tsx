import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const SelfRentingHouse = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    // レスポンスとして住宅入居費を受け取るため、空オブジェクトを設定
    newHousehold.世帯一覧.世帯1.住宅入居費 = {
      [currentDate]: null,
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    delete newHousehold.世帯一覧.世帯1.住宅入居費;
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="家を借りたいですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) => {
        return null // TODO: あとで修正
        // if (household.世帯員[personName]?.内部障害?.[currentDate] != null) {
        //   return household.世帯員[personName].内部障害[currentDate] === '有';
        // }
        // return null;
      }}
    />
  );
};

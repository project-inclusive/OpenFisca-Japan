import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import {
  currentDateAtom,
  householdAtom,
  frontendHouseholdAtom,
} from '../../../state';

export const SelfRentingHouse = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    // レスポンスとして住宅入居費を受け取るため、空オブジェクトを設定
    newHousehold.世帯一覧.世帯1.住宅入居費 = {
      [currentDate]: null,
    };
    setHousehold(newHousehold);

    const newFrontendHousehold = { ...frontendHousehold };
    newFrontendHousehold.世帯['家を借りたい'] = true;
    setFrontendHousehold(newFrontendHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    delete newHousehold.世帯一覧.世帯1.住宅入居費;
    setHousehold(newHousehold);

    const newFrontendHousehold = { ...frontendHousehold };
    newFrontendHousehold.世帯['家を借りたい'] = false;
    setFrontendHousehold(newFrontendHousehold);
  };

  return (
    <YesNoQuestion
      title="家を借りたいですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ frontendHousehold }: { frontendHousehold: any }) => {
        if (frontendHousehold.世帯['家を借りたい'] != null) {
          return frontendHousehold.世帯['家を借りたい'];
        }
        return null;
      }}
    />
  );
};

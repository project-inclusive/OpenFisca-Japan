import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { YesNoQuestion } from '../templates/yesNoQuestion';

export const LeaveOfAbsenseWithoutIncome = ({
  personName,
}: {
  personName: string;
}) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].休業中に給与の支払いがない = {
      [currentDate]: true,
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].休業中に給与の支払いがない = {
      [currentDate]: false,
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      // 人に対する「休業中」という表現がなじみが薄いので、UI上の文章は「休職中」にする
      title="休職中に給与の支払いがない状態ですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};

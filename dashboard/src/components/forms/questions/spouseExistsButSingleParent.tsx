import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';
import { ListItem, UnorderedList } from '@chakra-ui/react';

export const SpouseExistsButSingleParent = () => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.配偶者がいるがひとり親に該当 = {
      [currentDate]: true,
    };
    setHousehold(newHousehold);
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯一覧.世帯1.配偶者がいるがひとり親に該当 = {
      [currentDate]: false,
    };
    setHousehold(newHousehold);
  };

  return (
    <YesNoQuestion
      title="以下のいずれかに当てはまりますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) => {
        if (household.世帯一覧.世帯1.配偶者がいるがひとり親に該当 != null) {
          return household.世帯一覧.世帯1.配偶者がいるがひとり親に該当[
            currentDate
          ];
        }
        return null;
      }}
    >
      <UnorderedList fontSize="md">
        <ListItem>重度の障害がある</ListItem>
        <ListItem>生死が不明</ListItem>
        <ListItem>子を1年以上遺棄している</ListItem>
        <ListItem>裁判所からのDV保護命令を受けた</ListItem>
        <ListItem>法令により1年以上拘禁されている</ListItem>
      </UnorderedList>
    </YesNoQuestion>
  );
};

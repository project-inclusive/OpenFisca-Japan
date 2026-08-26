import { ListItem, UnorderedList } from '@chakra-ui/react';

export const SpouseExistsButSingleParent = () => {
  return (
    <UnorderedList fontSize="md">
      <ListItem>重度の障害がある</ListItem>
      <ListItem>生死が不明</ListItem>
      <ListItem>子を1年以上遺棄している</ListItem>
      <ListItem>裁判所からのDV保護命令を受けた</ListItem>
      <ListItem>法令により1年以上拘禁されている</ListItem>
    </UnorderedList>
  );
};

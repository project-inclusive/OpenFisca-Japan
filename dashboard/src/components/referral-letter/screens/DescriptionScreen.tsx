import { Box, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react';

import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ReferralHeader } from '../components/ReferralHeader';

export const DescriptionScreen = ({ onNext }: { onNext: () => void }) => (
  <FlowShell
    header={<ReferralHeader />}
    title={
      <span id="referral-page-heading" tabIndex={-1}>
        紹介状をつくる
      </span>
    }
    navigation={
      <Box data-testid="referral-start-button">
        <FlowNavigation
          onNext={onNext}
          nextLabel="注意事項を確認する"
          highContrast
        />
      </Box>
    }
  >
    <Stack spacing={4} textAlign="left" w="100%">
      <Text>
        質問に答えて困りごとを整理し、相談窓口で見せられる紹介状を作成します。
      </Text>
      <UnorderedList spacing={2} pl={3}>
        <ListItem>選んだ分野について、7つの質問に回答します。</ListItem>
        <ListItem>
          回答から、主な困りごとと相談窓口の案内をまとめます。
        </ListItem>
        <ListItem>氏名・メールアドレスの入力は任意です。</ListItem>
        <ListItem>紹介状は画像で保存したり、印刷したりできます。</ListItem>
      </UnorderedList>
      <Text fontWeight="bold">
        この機能は診断ではなく、支援を受けられるかどうかを決めるものでもありません。
      </Text>
    </Stack>
  </FlowShell>
);

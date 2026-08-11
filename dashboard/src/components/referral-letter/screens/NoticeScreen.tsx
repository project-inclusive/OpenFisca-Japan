import {
  Checkbox,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';

import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ReferralHeader } from '../components/ReferralHeader';

type NoticeScreenProps = {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

export const NoticeScreen = ({
  accepted,
  onAcceptedChange,
  onBack,
  onNext,
}: NoticeScreenProps) => (
  <FlowShell
    header={<ReferralHeader />}
    title={
      <span id="referral-page-heading" tabIndex={-1}>
        利用前の確認
      </span>
    }
    navigation={
      <FlowNavigation
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!accepted}
        highContrast
      />
    }
  >
    <Stack spacing={5} textAlign="left" w="100%">
      <Text>紹介状機能を利用する前に、次の内容をご確認ください。</Text>
      <UnorderedList spacing={3} pl={3}>
        <ListItem>診断や支援可否を決める機能ではない。</ListItem>
        <ListItem>紹介状は窓口へ自動送信されない。</ListItem>
        <ListItem>
          入力はサーバーへ送信・保存せず、このタブのセッション内だけに保持する。
        </ListItem>
        <ListItem>生成した画像・印刷物は利用者自身が管理する。</ListItem>
      </UnorderedList>
      <Checkbox
        isChecked={accepted}
        onChange={(event) => onAcceptedChange(event.target.checked)}
        size="lg"
        minH="44px"
        colorScheme="cyan"
        data-testid="referral-notice-checkbox"
      >
        上記を確認し、紹介状機能を利用します
      </Checkbox>
    </Stack>
  </FlowShell>
);

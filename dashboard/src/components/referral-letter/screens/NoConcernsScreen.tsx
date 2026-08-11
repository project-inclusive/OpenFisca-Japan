import { Button, Stack, Text } from '@chakra-ui/react';

import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ReferralHeader } from '../components/ReferralHeader';

type NoConcernsScreenProps = {
  onBack: () => void;
  onReturnHome: () => void;
};

export const NoConcernsScreen = ({
  onBack,
  onReturnHome,
}: NoConcernsScreenProps) => (
  <FlowShell
    header={<ReferralHeader />}
    title={
      <span id="referral-page-heading" tabIndex={-1}>
        回答結果
      </span>
    }
    navigation={
      <FlowNavigation
        onBack={onBack}
        onNext={onReturnHome}
        nextLabel="トップページへ戻る"
        highContrast
      />
    }
  >
    <Stack spacing={5} w="100%">
      <Text>
        回答内容からは、現在、大きな困り事はなさそうです。状況が変わったときは、いつでももう一度ご利用ください。
      </Text>
      <Button
        variant="link"
        color="cyan.800"
        _hover={{ color: 'cyan.900' }}
        onClick={onReturnHome}
      >
        最初からやり直す
      </Button>
    </Stack>
  </FlowShell>
);

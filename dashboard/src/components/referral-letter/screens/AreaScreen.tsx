import { Stack, Text } from '@chakra-ui/react';

import { PressedChoiceButton } from '../../forms/PressedChoiceButton';
import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { REFERRAL_AREA_CONFIGS } from '../config';
import { ReferralHeader } from '../components/ReferralHeader';
import type { ReferralAreaId } from '../types';

type AreaScreenProps = {
  areaId: ReferralAreaId | null;
  onSelect: (areaId: ReferralAreaId) => void;
  onBack: () => void;
  onNext: () => void;
};

export const AreaScreen = ({
  areaId,
  onSelect,
  onBack,
  onNext,
}: AreaScreenProps) => (
  <FlowShell
    header={<ReferralHeader />}
    title={
      <span id="referral-page-heading" tabIndex={-1}>
        相談したい分野
      </span>
    }
    navigation={
      <FlowNavigation
        onBack={onBack}
        onNext={onNext}
        nextDisabled={areaId === null}
        highContrast
      />
    }
  >
    <Stack as="fieldset" spacing={3} border="0" p={0} m={0} w="100%">
      <Text as="legend" mb={2}>
        あなたにもっとも近い分野を1つ選んでください。
      </Text>
      {REFERRAL_AREA_CONFIGS.map((area) => (
        <PressedChoiceButton
          key={area.id}
          isPressed={areaId === area.id}
          highContrast
          onClick={() => onSelect(area.id)}
          data-testid={`referral-area-${area.id}`}
          whiteSpace="normal"
          minH="3.5em"
          h="auto"
          py={3}
        >
          {area.label}
        </PressedChoiceButton>
      ))}
    </Stack>
  </FlowShell>
);

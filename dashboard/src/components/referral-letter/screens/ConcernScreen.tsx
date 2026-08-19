import { Box, Stack, Text } from '@chakra-ui/react';

import { PressedChoiceButton } from '../../forms/PressedChoiceButton';
import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ReferralHeader } from '../components/ReferralHeader';
import type { ConcernCandidate } from '../types';

type ConcernScreenProps = {
  candidates: readonly ConcernCandidate[];
  mainConcernId: string | null;
  onSelectMain: (concernId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const CandidateContent = ({ candidate }: { candidate: ConcernCandidate }) => (
  <Stack spacing={1} alignItems="flex-start" textAlign="left" w="100%">
    <Text fontWeight="bold">{candidate.questionLabel}</Text>
    <Text fontSize="sm">回答：{candidate.answerLabel}</Text>
  </Stack>
);

export const ConcernScreen = ({
  candidates,
  mainConcernId,
  onSelectMain,
  onBack,
  onNext,
}: ConcernScreenProps) => (
  <FlowShell
    header={<ReferralHeader />}
    title={
      <span id="referral-page-heading" tabIndex={-1}>
        困りごとを選ぶ
      </span>
    }
    navigation={
      <FlowNavigation
        onBack={onBack}
        onNext={onNext}
        nextDisabled={mainConcernId === null}
        highContrast
      />
    }
  >
    <Box as="fieldset" border="0" p={0} m={0} w="100%">
      <Text as="legend" fontWeight="bold" mb={3}>
        主な困りごとを1件選んでください（必須）
      </Text>
      <Stack spacing={2}>
        {candidates.map((candidate) => (
          <PressedChoiceButton
            key={candidate.id}
            isPressed={mainConcernId === candidate.id}
            highContrast
            onClick={() => onSelectMain(candidate.id)}
            data-testid={`referral-main-${candidate.id}`}
            h="auto"
            minH="4.5em"
            py={3}
            whiteSpace="normal"
          >
            <CandidateContent candidate={candidate} />
          </PressedChoiceButton>
        ))}
      </Stack>
    </Box>
  </FlowShell>
);

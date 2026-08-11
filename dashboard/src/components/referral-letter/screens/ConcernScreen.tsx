import { Box, Stack, Text } from '@chakra-ui/react';

import { PressedChoiceButton } from '../../forms/PressedChoiceButton';
import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { ReferralHeader } from '../components/ReferralHeader';
import type { ConcernCandidate } from '../types';

type ConcernScreenProps = {
  candidates: readonly ConcernCandidate[];
  mainConcernId: string | null;
  otherConcernIds: readonly string[];
  onSelectMain: (concernId: string) => void;
  onToggleOther: (concernId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const CandidateContent = ({ candidate }: { candidate: ConcernCandidate }) => (
  <Stack spacing={1} alignItems="flex-start" textAlign="left" w="100%">
    <Text fontWeight="bold">{candidate.questionLabel}</Text>
    <UrgencyBadge urgency={candidate.urgency} />
    <Text fontSize="sm">回答：{candidate.answerLabel}</Text>
  </Stack>
);

export const ConcernScreen = ({
  candidates,
  mainConcernId,
  otherConcernIds,
  onSelectMain,
  onToggleOther,
  onBack,
  onNext,
}: ConcernScreenProps) => {
  const reachedOtherLimit = otherConcernIds.length >= 3;
  const otherCandidates = candidates.filter(
    (candidate) => candidate.id !== mainConcernId
  );

  return (
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
      <Stack spacing={7} w="100%">
        <Box as="fieldset" border="0" p={0} m={0}>
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

        {mainConcernId !== null && otherCandidates.length > 0 ? (
          <Box as="fieldset" border="0" p={0} m={0}>
            <Text as="legend" fontWeight="bold" mb={1}>
              その他の困りごと（任意・最大3件）
            </Text>
            <Text fontSize="sm" mb={3} aria-live="polite">
              {otherConcernIds.length} / 3件を選択中
            </Text>
            <Stack spacing={2}>
              {otherCandidates.map((candidate) => {
                const isSelected = otherConcernIds.includes(candidate.id);
                return (
                  <PressedChoiceButton
                    key={candidate.id}
                    isPressed={isSelected}
                    highContrast
                    onClick={() => onToggleOther(candidate.id)}
                    isDisabled={reachedOtherLimit && !isSelected}
                    data-testid={`referral-other-${candidate.id}`}
                    h="auto"
                    minH="4.5em"
                    py={3}
                    whiteSpace="normal"
                  >
                    <CandidateContent candidate={candidate} />
                  </PressedChoiceButton>
                );
              })}
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </FlowShell>
  );
};

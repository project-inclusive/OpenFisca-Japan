import { Box, Flex, Stack, Text } from '@chakra-ui/react';

import { PressedChoiceButton } from '../../forms/PressedChoiceButton';
import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ConcernCandidateContent } from '../components/ConcernCandidateContent';
import { ReferralHeader } from '../components/ReferralHeader';
import { ReferralUrgencyBadge } from '../components/ReferralUrgencyBadge';
import { MAX_OTHER_CONCERNS } from '../logic';
import type { ConcernCandidate } from '../types';

type OtherConcernScreenProps = {
  candidates: readonly ConcernCandidate[];
  mainConcernId: string;
  otherConcernIds: readonly string[];
  onToggleOther: (concernId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export const OtherConcernScreen = ({
  candidates,
  mainConcernId,
  otherConcernIds,
  onToggleOther,
  onBack,
  onNext,
}: OtherConcernScreenProps) => {
  const mainConcern = candidates.find(
    (candidate) => candidate.id === mainConcernId
  );
  const otherCandidates = candidates.filter(
    (candidate) => candidate.id !== mainConcernId
  );
  const reachedOtherLimit = otherConcernIds.length >= MAX_OTHER_CONCERNS;

  return (
    <FlowShell
      header={<ReferralHeader />}
      title={
        <span id="referral-page-heading" tabIndex={-1}>
          その他の困りごとを選ぶ
        </span>
      }
      navigation={
        <FlowNavigation onBack={onBack} onNext={onNext} highContrast />
      }
    >
      <Stack spacing={5} w="100%">
        {mainConcern ? (
          <Box bg="cyan.50" borderRadius="md" p={3}>
            <Text fontSize="sm" fontWeight="bold">
              選択した主な困りごと
            </Text>
            <Flex
              align="center"
              justify="space-between"
              gap={2}
              flexWrap="wrap"
            >
              <Text>{mainConcern.questionLabel}</Text>
              <ReferralUrgencyBadge level={mainConcern.urgencyLevel} />
            </Flex>
          </Box>
        ) : null}

        <Box as="fieldset" border="0" p={0} m={0}>
          <Text as="legend" fontWeight="bold" mb={1}>
            その他にも相談したい困りごとがあれば選んでください （任意・最大
            {MAX_OTHER_CONCERNS}件）
          </Text>
          <Text fontSize="sm" mb={3} aria-live="polite">
            {otherConcernIds.length} / {MAX_OTHER_CONCERNS}件を選択中
          </Text>

          {otherCandidates.length === 0 ? (
            <Text>選択できるその他の困りごとはありません。</Text>
          ) : (
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
                    <ConcernCandidateContent candidate={candidate} />
                  </PressedChoiceButton>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>
    </FlowShell>
  );
};

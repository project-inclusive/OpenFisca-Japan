import { Flex, Stack, Text } from '@chakra-ui/react';

import type { ConcernCandidate } from '../types';
import { ReferralUrgencyBadge } from './ReferralUrgencyBadge';

type ConcernCandidateContentProps = {
  candidate: ConcernCandidate;
};

export const ConcernCandidateContent = ({
  candidate,
}: ConcernCandidateContentProps) => (
  <Stack spacing={1} alignItems="flex-start" textAlign="left" w="100%">
    <Flex
      align="flex-start"
      justify="space-between"
      gap={2}
      w="100%"
      flexWrap="wrap"
    >
      <Text fontWeight="bold">{candidate.questionLabel}</Text>
      <ReferralUrgencyBadge level={candidate.urgencyLevel} />
    </Flex>
    <Text fontSize="sm">回答：{candidate.answerLabel}</Text>
  </Stack>
);

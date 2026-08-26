import { Badge } from '@chakra-ui/react';

import { REFERRAL_URGENCY_LABELS } from '../logic';
import type { ReferralUrgencyLevel } from '../types';

const BADGE_STYLES: Readonly<
  Record<ReferralUrgencyLevel, { background: string; color: string }>
> = {
  low: { background: 'green.100', color: 'green.900' },
  medium: { background: 'orange.100', color: 'orange.900' },
  high: { background: 'red.100', color: 'red.900' },
};

type ReferralUrgencyBadgeProps = {
  level: ReferralUrgencyLevel;
};

export const ReferralUrgencyBadge = ({ level }: ReferralUrgencyBadgeProps) => {
  const style = BADGE_STYLES[level];

  return (
    <Badge
      data-testid="referral-urgency-badge"
      data-urgency-level={level}
      bg={style.background}
      color={style.color}
      borderRadius="full"
      flexShrink={0}
      fontSize="xs"
      px={2}
      py={1}
      textTransform="none"
      whiteSpace="nowrap"
    >
      緊急度：{REFERRAL_URGENCY_LABELS[level]}
    </Badge>
  );
};

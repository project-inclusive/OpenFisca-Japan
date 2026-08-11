import { Tag } from '@chakra-ui/react';

import { Urgency } from '../types';

const urgencyPresentation: Record<
  Urgency,
  { label: string; colorScheme: string; color?: string }
> = {
  none: { label: '問題なし', colorScheme: 'blue' },
  low: { label: '低', colorScheme: 'green' },
  medium: { label: '中', colorScheme: 'yellow', color: 'gray.900' },
  high: { label: '高', colorScheme: 'red' },
};

export const urgencyLabelOf = (urgency: Urgency): string =>
  urgencyPresentation[urgency].label;

export const UrgencyBadge = ({ urgency }: { urgency: Urgency }) => {
  const presentation = urgencyPresentation[urgency];

  return (
    <Tag
      colorScheme={presentation.colorScheme}
      color={presentation.color}
      fontWeight="bold"
      aria-label={`緊急度 ${presentation.label}`}
    >
      緊急度：{presentation.label}
    </Tag>
  );
};

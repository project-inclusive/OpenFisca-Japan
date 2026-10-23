import { Tag } from '@chakra-ui/react';

export const CalculationLabel = ({
  text,
  colour,
}: {
  text: string;
  colour: string;
}) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '15px' }}>
    <Tag variant="unstyled" size="lg" color={colour} whiteSpace="nowrap">
      {text}
    </Tag>
  </div>
);

import { Tag } from '@chakra-ui/react';

export const CalculationLabel = ({
  text,
  colour,
  textColor,
  borderColor,
}: {
  text: string;
  colour: string;
  textColor?: string;
  borderColor?: string;
}) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '15px' }}>
    <Tag
      variant="outline"
      size="lg"
      colorScheme={colour}
      color={textColor}
      borderColor={borderColor}
      sx={{ height: '48px' }}
      whiteSpace="nowrap"
    >
      {text}
    </Tag>
  </div>
);

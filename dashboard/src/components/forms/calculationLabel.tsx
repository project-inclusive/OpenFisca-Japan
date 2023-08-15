import { Tag } from '@chakra-ui/react';

export const CalculationLabel = ({ text, colour }: { text: string, colour: string }) => 
<div style={{ display: "flex", justifyContent: "flex-end", margin: "15px", }}>
    <Tag 
    variant="outline"
    size="lg"
    colorScheme={colour}
    sx={{ height: "32px" }}
    >
    {text}
    </Tag>
</div>

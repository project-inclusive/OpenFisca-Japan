import {
  Box,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

// 制度の算出結果 result value of loans
export const LoanAccordion = ({ loanResult }: { loanResult: any }) => {
  return (
    <>
      <Accordion allowMultiple>
        {loanResult &&
          Object.values(loanResult).map((val: any, index) => (
            <AccordionItem key={index}>
              <h2>
                <AccordionButton>
                  <AccordionIcon />
                  <Box flex="1" textAlign="left">
                    {val.name}
                  </Box>
                  <Box flex="1" textAlign="right">
                    {/* １万円単位で表示 */}~{val.displayedMoney / 10_000} 万
                    {val.unit}
                  </Box>
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {val.caption.map((line: string, index: any) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
                <Box color="blue">
                  <a href={val.reference} target="_blank">
                    詳細リンク
                    <ExternalLinkIcon ml={1} />
                  </a>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
      </Accordion>
    </>
  );
};

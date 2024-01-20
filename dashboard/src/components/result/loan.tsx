import { useState, useEffect } from 'react';
import { Box, Center, Text, Tooltip } from '@chakra-ui/react';
import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';

import configData from '../../config/app_config.json';
import { currentDateAtom } from '../../state';
import { useRecoilValue } from 'recoil';
import { HelpDesk } from './helpDesk';
import { LoanAccordion } from './loanAccordion';

export const Loan = ({ result }: { result: any }) => {
  const [displayedResult, setDisplayedResult] = useState<any>();
  const currentDate = useRecoilValue(currentDateAtom);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const loanResult: Obj = {};

    if (result) {
      for (const [categoryName, categoryInfo] of Object.entries(
        configData.result.貸付制度
      )) {
        loanResult[categoryName] = {};
        for (const [loanName, loanInfo] of Object.entries(
          categoryInfo.制度一覧
        )) {
          if (loanName in result.世帯一覧.世帯1) {
            if (result.世帯一覧.世帯1[loanName][currentDate] > 0) {
              loanResult[categoryName][loanName] = {
                name: loanName,
                unit: loanInfo.unit,
                caption: loanInfo.caption,
                reference: loanInfo.reference,
                displayedMoney: Number(
                  result.世帯一覧.世帯1[loanName][currentDate]
                ),
              };
            }
          }
        }
      }
      setDisplayedResult(loanResult);
      console.log(`display ${JSON.stringify(displayedResult)}`);
    }
  }, [result]);

  return (
    <>
      {displayedResult && (
        <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
          <Center
            fontSize={configData.style.subTitleFontSize}
            fontWeight="medium"
            mb={2}
          >
            {configData.result.loanDescription}
          </Center>
          {Object.entries(configData.result.貸付制度).map(
            (category: any, index: number) => (
              <Box key={index}>
                {Boolean(Object.keys(displayedResult[category[0]]).length) && (
                  <Box mt={4}>
                    <Box fontWeight="medium" mb={2}>
                      {/* TODO: 他の貸付制度を追加したらconfigDataから読み込むようにする */}
                      {category[0]}
                    </Box>

                    <Text>
                      {category[1].caption.map(
                        (line: string, indexLine: any) => (
                          <span key={indexLine}>{line}</span>
                        )
                      )}
                      {category[0] === '生活福祉資金貸付制度' && (
                        <Tooltip
                          label={configData.result.consultationDescription3}
                          isOpen={isLabelOpen}
                          bg="gray.600"
                        >
                          <InfoIcon
                            ml={1}
                            color="blue.500"
                            onMouseEnter={() => setIsLabelOpen(true)}
                            onMouseLeave={() => setIsLabelOpen(false)}
                            onClick={() => setIsLabelOpen(true)}
                          />
                        </Tooltip>
                      )}
                    </Text>

                    {category[0] === '生活福祉資金貸付制度' && (
                      <HelpDesk></HelpDesk>
                    )}
                    {category[1].reference && (
                      <Box color="blue" mb={2}>
                        <a href={category[1].reference} target="_blank">
                          詳細リンク
                          <ExternalLinkIcon ml={1} />
                        </a>
                      </Box>
                    )}

                    <LoanAccordion
                      loanResult={displayedResult[category[0]]}
                    ></LoanAccordion>
                  </Box>
                )}
              </Box>
            )
          )}
        </Box>
      )}
    </>
  );
};

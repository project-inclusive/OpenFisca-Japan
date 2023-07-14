import { useState, useEffect } from "react";
import {
  Box,
  Center,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
} from "@chakra-ui/react";

import configData from "../app_config.json";

export const Loan = ({
  result,
  currentDate,
}: {
  result: any;
  currentDate: string;
}) => {
  const [displayedResult, setDisplayedResult] = useState<any>();

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const loanResult: Obj = {};

    if (result) {
      for (const [loanName, loanInfo] of Object.entries(
        configData.result.貸付制度.制度一覧
      )) {
        if (loanName in result.世帯.世帯1) {
          if (result.世帯.世帯1[loanName][currentDate] > 0) {
            loanResult[loanName] = {
              name: loanName,
              unit: loanInfo.unit,
              caption: loanInfo.caption,
              reference: loanInfo.reference,
              displayedMoney: Number(result.世帯.世帯1[loanName][currentDate]).toLocaleString()
            };
          }
        }
      }

      setDisplayedResult(loanResult);
      console.log(`display ${JSON.stringify(displayedResult)}`);
    }
  }, [result]);

  return (
    <>
      {displayedResult && (Object.keys(displayedResult).length > 0) &&
        <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
          <Center
            fontSize={configData.style.subTitleFontSize}
            fontWeight="medium"
            mb={2}
          >
            {configData.result.loanDescription}
          </Center>

          <Box
            fontWeight="medium"
            mb={2}
          >
            {/* TODO: 他の貸付制度を追加したらconfigDataから読み込むようにする */}
            生活福祉資金貸付制度
          </Box>

          {configData.result.貸付制度.caption.map((line: string, index: any) => (
            <span key={index}>
              {line}
              <br/>
            </span>
          ))}
          <Box color="blue">
            <a href={configData.result.貸付制度.reference}>詳細リンク</a>
          </Box>

          <Accordion allowMultiple>
            {displayedResult &&
              Object.values(displayedResult).map((val: any, index) => (
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <AccordionIcon />
                      <Box flex="1" textAlign="left">
                        {val.name}
                      </Box>
                      <Box flex="1" textAlign="right">
                        {val.displayedMoney} {val.unit}
                      </Box>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    {val.caption.map((line: string, index: any) => (
                      <span key={index}>
                        {line}
                        <br/>
                      </span>
                    ))}
                    <br></br>
                    <Box color="blue">
                      <a href={val.reference}>詳細リンク</a>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
          </Accordion>
        </Box>
      }
    </>
  );
};

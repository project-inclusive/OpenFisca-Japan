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

import configData from "../../config/app_config.json";

export const Benefit = ({
  result,
  currentDate,
}: {
  result: any;
  currentDate: string;
}) => {
  const [totalAllowance, setTotalAllowance] = useState<string>("0");
  const [displayedResult, setDisplayedResult] = useState<any>();

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const minMaxResult: Obj = {};

    if (result) {
      for (const [allowanceName, allowanceInfo] of Object.entries(
        configData.result.給付制度.制度一覧
      )) {
        if (allowanceName in result.世帯.世帯1) {
          if (result.世帯.世帯1[allowanceName][currentDate] > 0) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              max: result.世帯.世帯1[allowanceName][currentDate],
              min: result.世帯.世帯1[allowanceName][currentDate],
              unit: allowanceInfo.unit,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
            };
          }
        } else if (`${allowanceName}_最大` in result.世帯.世帯1) {
          if (result.世帯.世帯1[`${allowanceName}_最大`][currentDate] > 0) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              max: result.世帯.世帯1[`${allowanceName}_最大`][currentDate],
              min: result.世帯.世帯1[`${allowanceName}_最小`][currentDate],
              unit: allowanceInfo.unit,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
            };
          }
        }
      }

      let totalAllowanceMax = 0;
      let totalAllowanceMin = 0;
      for (const [key, value] of Object.entries(minMaxResult)) {
        totalAllowanceMax += value.max;
        totalAllowanceMin += value.min;

        if (value.max === value.min) {
          minMaxResult[key].displayedMoney = Number(value.max).toLocaleString();
        } else {
          // 最小額と最大額が異なる場合は「（最小額）〜（最大額）」の文字列を格納
          minMaxResult[key].displayedMoney = `${Number(
            value.min
          ).toLocaleString()}~${Number(value.max).toLocaleString()}`;
        }
      }

      // 合計額を格納
      if (totalAllowanceMax === totalAllowanceMin) {
        setTotalAllowance(totalAllowanceMax.toLocaleString());
      } else {
        setTotalAllowance(
          `${totalAllowanceMin.toLocaleString()}~${totalAllowanceMax.toLocaleString()}`
        );
      }

      setDisplayedResult(minMaxResult);
    }
  }, [result]);

  return (
    <>
      <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
        <Center
          fontSize={configData.style.subTitleFontSize}
          fontWeight="medium"
          mb={2}
        >
          {configData.result.benefitDescription}
        </Center>

        {configData.result.給付制度.caption[0]}

        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg="yellow.100"
                fontWeight="semibold"
                _hover={{ bg: "yellow.100" }}
              >
                <Box flex="1" textAlign="left">
                  合計
                </Box>
                <Box flex="1" textAlign="right">
                  {totalAllowance} 円/月
                </Box>
              </AccordionButton>
            </h2>
          </AccordionItem>

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
                  {val.caption[0]}
                  <br></br>
                  <Box color="blue">
                    <a href={val.reference}>詳細リンク</a>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
        </Accordion>
      </Box>
    </>
  );
};

import { useState, useEffect } from 'react';
import {
  Box,
  Center,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import configData from '../../config/app_config.json';
import { useRecoilValue } from 'recoil';
import { currentDateAtom } from '../../state';
import { HelpDesk } from './helpDesk';

// 窓口表示するか否かを判定
const showsHelpDesk = (
  allowanceName: string | null,
  result: any,
  currentDate: string
) => {
  // 設定されていない場合表示しない
  if (allowanceName == null) {
    return false;
  }

  if (
    allowanceName ===
    '先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業'
  ) {
    // HIVに感染している世帯員がいる場合のみ窓口表示
    const members = Object.values(result.世帯員);
    return (
      members.filter((member: any) => member.HIV感染者である[currentDate])
        .length > 0
    );
  }

  // それ以外の場合: 無条件で表示
  return true;
};

export const Benefit = ({ result }: { result: any }) => {
  const [totalAllowance, setTotalAllowance] = useState<string>('0');
  const [displayedResult, setDisplayedResult] = useState<any>();
  const currentDate = useRecoilValue(currentDateAtom);

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const minMaxResult: Obj = {};

    if (result) {
      for (const [allowanceName, allowanceInfo] of Object.entries(
        configData.result.給付制度.制度一覧
      )) {
        if (allowanceName in result.世帯一覧.世帯1) {
          if (result.世帯一覧.世帯1[allowanceName][currentDate] > 0) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              max: result.世帯一覧.世帯1[allowanceName][currentDate],
              min: result.世帯一覧.世帯1[allowanceName][currentDate],
              unit: allowanceInfo.unit,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
              helpDesk:
                showsHelpDesk(allowanceName, result, currentDate) &&
                allowanceInfo.helpDesk,
            };
          }
        } else if (`${allowanceName}_最大` in result.世帯一覧.世帯1) {
          if (result.世帯一覧.世帯1[`${allowanceName}_最大`][currentDate] > 0) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              max: result.世帯一覧.世帯1[`${allowanceName}_最大`][currentDate],
              min: result.世帯一覧.世帯1[`${allowanceName}_最小`][currentDate],
              unit: allowanceInfo.unit,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
              helpDesk:
                showsHelpDesk(allowanceName, result, currentDate) &&
                allowanceInfo.helpDesk,
            };
          }
        }
      }

      let totalAllowanceMax = 0;
      let totalAllowanceMin = 0;
      for (const [key, value] of Object.entries(minMaxResult)) {
        // 小数点1桁まで万円単位に変換 (1万円以下の給付もあり得るため)
        const min = Math.floor(Number(value.min) / 1000) / 10;
        const max = Math.floor(Number(value.max) / 1000) / 10;

        totalAllowanceMax += max;
        totalAllowanceMin += min;

        // 後で金額順にソートするため、最大額を格納
        minMaxResult[key].maxMoney = max;

        if (value.max === value.min) {
          minMaxResult[key].displayedMoney = max;
        } else {
          // 最小額と最大額が異なる場合は「（最小額）〜（最大額）」の文字列を格納
          minMaxResult[key].displayedMoney = `${min}~${max}`;
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

      // 表示のため最大額が小さい順にソート
      const sortedMinMaxResult = Object.values(minMaxResult).sort(
        (a: any, b: any) => a.maxMoney - b.maxMoney
      );
      setDisplayedResult(sortedMinMaxResult);
    }
  }, [result]);

  const existsResult = () => {
    return displayedResult && Object.keys(displayedResult).length !== 0;
  };

  return (
    <>
      {existsResult() && (
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
            {/* // 一時金と継続支給が合算されていて紛らわしいため合計額は非表示。
          // ただし今後、一時金と継続支給それぞれの合計表示はする可能性あり
          <AccordionItem>
            <h2>
              <AccordionButton
                bg="yellow.100"
                fontWeight="semibold"
                _hover={{ bg: 'yellow.100' }}
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
          */}

            {displayedResult.map((val: any, index: any) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <AccordionIcon />
                    <Box flex="1" textAlign="left">
                      {val.name}
                    </Box>
                    <Box flex="1" textAlign="right">
                      {/* 小数点1桁まで万円単位で表示 */}
                      {val.displayedMoney} 万{val.unit}
                    </Box>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    {val.caption.map((line: string, index: any) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Text>
                  <Box color="blue">
                    <a href={val.reference} target="_blank" rel="noreferrer">
                      詳細リンク
                      <ExternalLinkIcon ml={1} />
                    </a>
                  </Box>
                  {val.helpDesk && <HelpDesk name={val.helpDesk} />}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}
    </>
  );
};

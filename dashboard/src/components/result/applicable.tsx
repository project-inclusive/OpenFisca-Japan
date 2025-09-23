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

  if (allowanceName === '特定疾病療養') {
    // HIVに感染している世帯員がいる場合のみ窓口表示
    const members = Object.values(result.世帯員);
    return (
      members.filter((member: any) => member.HIV感染者である[currentDate])
        .length > 0
    );
  }

  if (allowanceName === '埼玉県私立学校の父母負担軽減') {
    // 埼玉県の場合のみ表示（埼玉県独自の精度のため https://www.pref.saitama.lg.jp/a0204/fubofutan2.html ）
    return result.世帯一覧.世帯1.居住都道府県[currentDate] === '埼玉県';
  }

  // それ以外の場合: 無条件で表示
  return true;
};

export const Applicable = ({
  result,
  frontendHouseholdResult,
}: {
  result: any;
  frontendHouseholdResult: any;
}) => {
  const [displayedResult, setDisplayedResult] = useState<any>();
  const currentDate = useRecoilValue(currentDateAtom);

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const applicableResult: Obj = {};

    if (result) {
      // バックエンドから返ってきた結果
      for (const [allowanceName, allowanceInfo] of Object.entries(
        configData.result.該当制度.制度一覧
      )) {
        if (allowanceInfo.variableName in result.世帯一覧.世帯1) {
          if (result.世帯一覧.世帯1[allowanceInfo.variableName][currentDate]) {
            applicableResult[allowanceName] = {
              name: allowanceName,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
              helpDesk:
                showsHelpDesk(allowanceName, result, currentDate) &&
                allowanceInfo.helpDesk,
            };
          }
        }
      }

      // フロントエンドで計算した結果
      for (const [allowanceName, allowanceInfo] of Object.entries(
        configData.result.該当制度.制度一覧
      )) {
        if (allowanceInfo.variableName in frontendHouseholdResult.制度) {
          if (frontendHouseholdResult.制度[allowanceInfo.variableName]) {
            applicableResult[allowanceName] = {
              name: allowanceName,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
              helpDesk:
                showsHelpDesk(allowanceName, result, currentDate) &&
                allowanceInfo.helpDesk,
            };
          }
        }
      }

      setDisplayedResult(Object.values(applicableResult));
    }

    // NOTE: frontendHouseholdResultを指定するとuseEffectが無限ループするためresultのみ指定
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
            {configData.result.applicableDescription}
          </Center>

          <Accordion allowMultiple>
            {displayedResult.map((val: any, index: any) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <AccordionIcon />
                    <Box flex="1" textAlign="left">
                      {val.name}
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
                  {val.reference && (
                    <Box color="blue">
                      <a href={val.reference} target="_blank" rel="noreferrer">
                        詳細リンク
                        <ExternalLinkIcon ml={1} />
                      </a>
                    </Box>
                  )}
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

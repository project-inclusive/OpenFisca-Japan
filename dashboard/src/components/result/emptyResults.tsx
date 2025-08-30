import { useState, useEffect } from 'react';
import { Box, ListItem, Text, UnorderedList } from '@chakra-ui/react';

import configData from '../../config/app_config.json';
import { currentDateAtom } from '../../state';
import { useRecoilValue } from 'recoil';

export const EmptyResults = ({
  result,
  frontendHouseholdResult,
}: {
  result: any;
  frontendHouseholdResult: any;
}) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const currentDate = useRecoilValue(currentDateAtom);

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  // TODO: Benefit, Loanの集計処理と共通化する
  useEffect(() => {
    if (result) {
      // 給付制度が1つでもあれば空ではない
      for (const name of Object.keys(configData.result.給付制度.制度一覧)) {
        if (name in result.世帯一覧.世帯1) {
          if (result.世帯一覧.世帯1[name][currentDate] > 0) {
            setIsEmpty(false);
            return;
          }
        }
        if (`${name}_最大` in result.世帯一覧.世帯1) {
          if (result.世帯一覧.世帯1[`${name}_最大`][currentDate] > 0) {
            setIsEmpty(false);
            return;
          }
        }
        console.log(frontendHouseholdResult.制度);
        if (Object.values(frontendHouseholdResult.制度).some((cond) => cond)) {
          setIsEmpty(false);
          return;
        }
      }

      // 貸付制度が1つでもあれば空ではない
      for (const categoryInfo of Object.values(configData.result.貸付制度)) {
        for (const loanName of Object.keys(categoryInfo.制度一覧)) {
          if (loanName in result.世帯一覧.世帯1) {
            if (result.世帯一覧.世帯1[loanName][currentDate] > 0) {
              setIsEmpty(false);
              return;
            }
          }
        }
      }

      setIsEmpty(true);
    }
  }, [result]);

  return (
    <>
      {isEmpty && (
        <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
          <Text>{configData.result.emptyResultsDescription.description1}</Text>
          <UnorderedList p={4}>
            {configData.result.emptyResultsDescription.items.map(
              (item: string, index: number) => (
                <ListItem key={index}>{item}</ListItem>
              )
            )}
          </UnorderedList>
          <Text>{configData.result.emptyResultsDescription.description2}</Text>
        </Box>
      )}
    </>
  );
};

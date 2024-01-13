import { useState, useEffect } from 'react';
import {
  Box,
  Center,
  Link,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';

import configData from '../../config/app_config.json';
import { data as SocialWelfareData } from '../../config/社会福祉協議会';
import { currentDateAtom, householdAtom } from '../../state';
import { useRecoilValue } from 'recoil';

export const Loan = ({ result }: { result: any }) => {
  const [displayedResult, setDisplayedResult] = useState<any>();
  const currentDate = useRecoilValue(currentDateAtom);
  const household = useRecoilValue(householdAtom);
  const [isLabelOpen, setIsLabelOpen] = useState(false);

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  const prefecture = household.世帯一覧.世帯1.居住都道府県[currentDate];

  const city = household.世帯一覧.世帯1.居住市区町村[currentDate];

  const getSocialWelfareCouncilData = () => {
    if (
      prefecture === '東京都' &&
      SocialWelfareData.東京都.hasOwnProperty(city)
    ) {
      const {
        施設名,
        郵便番号,
        所在地,
        経度,
        緯度,
        座標系,
        電話番号,
        WebサイトURL,
      } = SocialWelfareData.東京都[city];

      return {
        施設名,
        郵便番号,
        所在地,
        経度,
        緯度,
        座標系,
        電話番号,
        WebサイトURL,
        googleMapsURL: encodeURI(
          `https://www.google.com/maps/search/${施設名}+${所在地}`
        ),
      };
    }

    return {
      施設名: null,
      郵便番号: null,
      所在地: null,
      経度: null,
      緯度: null,
      座標系: null,
      電話番号: null,
      WebサイトURL: '',
      googleMapsURL: '',
    };
  };

  const aboutLink = {
    link: 'https://www.zcwvc.net/about/list.html',
    title: '全国の社会福祉協議会一覧',
  };

  useEffect(() => {
    const loanResult: Obj = {};

    if (result) {
      for (const [loanName, loanInfo] of Object.entries(
        configData.result.貸付制度.制度一覧
      )) {
        if (loanName in result.世帯一覧.世帯1) {
          if (result.世帯一覧.世帯1[loanName][currentDate] > 0) {
            loanResult[loanName] = {
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

      setDisplayedResult(loanResult);
      console.log(`display ${JSON.stringify(displayedResult)}`);
    }
  }, [result]);

  return (
    <>
      {displayedResult && Object.keys(displayedResult).length > 0 && (
        <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
          <Center
            fontSize={configData.style.subTitleFontSize}
            fontWeight="medium"
            mb={2}
          >
            {configData.result.loanDescription}
          </Center>

          <Box fontWeight="medium" mb={2}>
            {/* TODO: 他の貸付制度を追加したらconfigDataから読み込むようにする */}
            生活福祉資金貸付制度
          </Box>

          <Text>
            {configData.result.貸付制度.caption.map(
              (line: string, index: any) => (
                <span key={index}>{line}</span>
              )
            )}
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
          </Text>

          <Box
            bg="white"
            borderRadius="xl"
            pt={1}
            pb={1}
            pr={2}
            pl={2}
            m={2}
            border="1px solid black"
          >
            {prefecture === '東京都' ? (
              <Box>
                {getSocialWelfareCouncilData().WebサイトURL ? (
                  <Link
                    href={getSocialWelfareCouncilData().WebサイトURL}
                    color="blue.500"
                    fontWeight={'semibold'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialWelfareCouncilData().施設名}
                  </Link>
                ) : (
                  <Text fontWeight={'semibold'}>
                    {getSocialWelfareCouncilData().施設名}
                  </Text>
                )}
                <Text>〒{getSocialWelfareCouncilData().郵便番号}</Text>
                <Link
                  href={getSocialWelfareCouncilData().googleMapsURL}
                  color="blue.500"
                  fontWeight={'semibold'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  地図を開く
                  <ExternalLinkIcon ml={1} />
                </Link>
                <br />
                <Text>
                  TEL:
                  <Link
                    href={`tel:${getSocialWelfareCouncilData().電話番号}`}
                    color="blue.500"
                    fontWeight={'semibold'}
                  >
                    {getSocialWelfareCouncilData().電話番号}
                  </Link>
                </Text>
              </Box>
            ) : (
              <Box>
                <Text fontWeight={'semibold'}>社会福祉協議会の調べ方</Text>
                <Text>
                  下記のページからお住まいの社会福祉協議会を選択してください
                </Text>
                <Link
                  href={aboutLink.link}
                  color="blue.500"
                  fontWeight={'semibold'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {aboutLink.title}
                  <ExternalLinkIcon ml={1} />
                </Link>
              </Box>
            )}
          </Box>

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
                        {/* １万円単位で表示 */}~{val.displayedMoney / 10_000}{' '}
                        万{val.unit}
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
                      <a href={val.reference}>詳細リンク</a>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              ))}
          </Accordion>
        </Box>
      )}
    </>
  );
};

import { useEffect, useState } from 'react';
import { Box, Link, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { data as SocialWelfareData } from '../../config/社会福祉協議会';
import { currentDateAtom, householdAtom } from '../../state';
import { useRecoilValue } from 'recoil';

export const HelpDesk = () => {
  const currentDate = useRecoilValue(currentDateAtom);
  const household = useRecoilValue(householdAtom);
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    setPrefecture(household.世帯一覧.世帯1.居住都道府県[currentDate]);
    setCity(household.世帯一覧.世帯1.居住市区町村[currentDate]);
  }, [household]);

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

  return (
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
  );
};

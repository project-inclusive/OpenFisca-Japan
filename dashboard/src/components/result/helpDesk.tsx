import { useEffect, useState } from 'react';
import { Box, Center, Link, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { data as SocialWelfareData } from '../../config/社会福祉協議会';
import { baseHospitalData, HIVBaseHospital } from '../../config/拠点病院';
import configData from '../../config/app_config.json';
import { currentDateAtom, householdAtom } from '../../state';
import { useRecoilValue } from 'recoil';
import { blockOfPrefecture } from '../../config/拠点病院';

// 社会福祉協議会の窓口
export const SocialWelfareCouncilHelpDesk = () => {
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
          <Box pl={4}>
            <Text>{getSocialWelfareCouncilData().所在地}</Text>
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

// 拠点病院の窓口
// TODO: 社協の窓口と共通のcomponentにする
export const BaseHospitalHelpDesk = () => {
  const currentDate = useRecoilValue(currentDateAtom);
  const household = useRecoilValue(householdAtom);
  const [prefecture, setPrefecture] = useState('');
  const [block, setBlock] = useState('');

  useEffect(() => {
    setPrefecture(household.世帯一覧.世帯1.居住都道府県[currentDate]);
    setBlock(
      blockOfPrefecture[household.世帯一覧.世帯1.居住都道府県[currentDate]]
    );
  }, [household]);

  const getBlockBaseHospitalData = () => {
    const hospitals = baseHospitalData.ブロック拠点病院[block];
    if (hospitals === undefined) {
      return [];
    }

    return Object.values(hospitals).map((hospital, _index) => {
      const { 施設名, 郵便番号, 所在地, 電話番号, WebサイトURL } = hospital;

      return {
        施設名,
        郵便番号,
        所在地,
        電話番号,
        WebサイトURL,
        googleMapsURL: encodeURI(
          `https://www.google.com/maps/search/${施設名}+${所在地}`
        ),
      };
    });
  };

  const getCentralBaseHospitalData = () => {
    const hospitals = baseHospitalData.中核拠点病院[prefecture];
    if (hospitals === undefined) {
      return [];
    }

    return Object.values(hospitals).map((hospital, _index) => {
      const { 施設名, 郵便番号, 所在地, 電話番号, WebサイトURL } = hospital;

      return {
        施設名,
        郵便番号,
        所在地,
        電話番号,
        WebサイトURL,
        googleMapsURL: encodeURI(
          `https://www.google.com/maps/search/${施設名}+${所在地}`
        ),
      };
    });
  };

  // ブロック拠点病院と中核拠点病院の重複を取り除く
  const hospitals = [
    ...getCentralBaseHospitalData(),
    ...getBlockBaseHospitalData(),
  ].filter((elem, index, arr) => {
    const sameNameIndex = arr.findIndex((e) => e.施設名 === elem.施設名);
    return sameNameIndex === index;
  });

  return (
    <>
      <Center pt={2}>
        {configData.result.helpDeskDescription.拠点病院.description1}
      </Center>
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
        {/* NOTE: ブロック拠点病院と中核拠点病院の重複を防ぐため unique() で重複削除 */}
        {hospitals.map((hospital, index) => (
          <Box key={index} pt={1} pb={2}>
            {hospital.WebサイトURL ? (
              <Link
                href={hospital.WebサイトURL}
                color="blue.500"
                fontWeight={'semibold'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hospital.施設名}
              </Link>
            ) : (
              <Text fontWeight={'semibold'}>{hospital.施設名}</Text>
            )}
            <Box pl={4}>
              <Text>{hospital.所在地}</Text>
              <Link
                href={hospital.googleMapsURL}
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
                  href={`tel:${hospital.電話番号}`}
                  color="blue.500"
                  fontWeight={'semibold'}
                >
                  {hospital.電話番号}
                </Link>
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

// 窓口名と窓口の対応
export const HelpDesk = ({ name }: { name: string }) => {
  const helpDesks: { [name: string]: JSX.Element } = {
    baseHospital: <BaseHospitalHelpDesk />,
    socialWelfareCouncil: <BaseHospitalHelpDesk />,
  };

  return helpDesks[name];
};

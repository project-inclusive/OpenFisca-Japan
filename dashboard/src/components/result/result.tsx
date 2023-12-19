import { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Center,
  Button,
  Spinner,
  Text,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import { InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import * as htmlToImage from 'html-to-image';

import configData from '../../config/app_config.json';
import { data as SocialWelfareData } from '../../config/社会福祉協議会';
import { useCalculate } from '../../hooks/calculate';
import { Benefit } from './benefit';
import { Loan } from './loan';
import { CalculationLabel } from '../forms/calculationLabel';
import { currentDateAtom } from '../../state';
import { useRecoilValue } from 'recoil';

const createFileName = (extension: string = '', ...names: string[]) => {
  if (!extension) {
    return '';
  }

  return `${names.join('')}.${extension}`;
};

export const Result = () => {
  const location = useLocation();
  // TODO: decode household from URL
  const { household, isSimpleCalculation } = location.state as {
    household: any;
    isSimpleCalculation: boolean;
  };

  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const navigate = useNavigate();

  const currentDate = useRecoilValue(currentDateAtom);
  const [result, calculate] = useCalculate();
  const [isDisplayChat, setIsDisplayChat] = useState('none');

  let calcOnce = true;
  useEffect(() => {
    if (calcOnce) {
      calculate(household).catch((e: any) => {
        console.log(e);

        // 想定外のエラーレスポンスを受け取り結果が取得できなかった場合、エラー画面へ遷移
        navigate('/response-error', {
          state: {
            isSimpleCalculation: isSimpleCalculation,
          },
        });
      });
      calcOnce = false;
    }
  }, []);

  const divRef = useRef<HTMLDivElement | null>(null);
  const [loadingScreenshotDownload, setLoadingScreenshotDownload] =
    useState(false);

  const takeScreenShot = async (
    node: HTMLDivElement | null
  ): Promise<string> => {
    setLoadingScreenshotDownload(true);
    if (!node) {
      throw new Error('Invalid element reference.');
    }
    const dataURI = await htmlToImage.toPng(node, {
      backgroundColor: '#C4F1F9',
    });
    return dataURI;
  };

  const download = (
    image: string,
    {
      name = 'お金サポート_結果',
      extension = 'png',
    }: { name?: string; extension?: string } = {}
  ): void => {
    const a = document.createElement('a');
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
    setLoadingScreenshotDownload(false);
  };

  const downloadScreenshot = (): void => {
    if (divRef.current) {
      takeScreenShot(divRef.current).then(download);
    }
  };

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

  const displayChat = useCallback(async (sec: number = 5) => {
    const sleep = (second: number) =>
      new Promise((resolve) => setTimeout(resolve, second * 1000));

    // wait some seconds because the page is auto scrolled to chatbot
    // in first few seconds of chatbot preparation
    await sleep(sec);
    console.log('display chatbot');
    setIsDisplayChat('');
  }, []);

  return (
    <div ref={divRef}>
      {!result && (
        <Center>
          <Spinner
            mt={20}
            thickness="4px"
            size="xl"
            color="cyan.600"
            speed="0.7s"
          />
        </Center>
      )}
      {result && (
        <>
          <CalculationLabel
            text={
              isSimpleCalculation
                ? configData.calculationForm.simpleCalculation
                : configData.calculationForm.detailedCalculation
            }
            colour={isSimpleCalculation ? 'teal' : 'blue'}
          />

          <Center
            fontSize={configData.style.subTitleFontSize}
            fontWeight="medium"
            mt={2}
            mb={2}
          >
            {configData.result.topDescription}
          </Center>

          <Benefit result={result} />
          <Loan result={result} />

          <Center pr={4} pl={4} pb={2}>
            <Text color="blue.900" fontSize="1.3em" fontWeight="semibold">
              {configData.result.consultationDescription1}
            </Text>
          </Center>
          <Center pr={4} pl={4} pb={4}>
            <Text>
              {configData.result.consultationDescription2}
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
          </Center>

          <Center pr={4} pl={4} pb={2}>
            <Box
              bg="white"
              borderRadius="xl"
              w="100%"
              pt={4}
              pb={4}
              pr={4}
              pl={4}
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
          </Center>

          <Center pr={4} pl={4} pb={4}>
            <Button
              as={RouterLink}
              to="/question-examples"
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="2em"
              width="100%"
              bg="gray.500"
              color="white"
              _hover={{ bg: 'gray.600' }}
            >
              {configData.result.questionExamplesButtonText}
            </Button>
          </Center>

          {isSimpleCalculation && (
            <>
              <Center pr={4} pl={4} pb={4}>
                {configData.result.detailedCalculationDescription}
              </Center>

              <Center pr={4} pl={4} pb={4}>
                <Button
                  as={RouterLink}
                  to="/calculate"
                  fontSize={configData.style.subTitleFontSize}
                  borderRadius="xl"
                  height="2em"
                  width="100%"
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                >
                  {configData.calculationForm.detailedCalculation}
                </Button>
              </Center>
            </>
          )}

          <Center pr={4} pl={4} pb={4}>
            <Button
              onClick={downloadScreenshot}
              loadingText={'読み込み中...'}
              isLoading={loadingScreenshotDownload}
              as="button"
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="2em"
              width="100%"
              bg="gray.500"
              color="white"
              _hover={{ bg: 'gray.600' }}
            >
              {configData.result.screenshotButtonText}
            </Button>
          </Center>

          <Box display={isDisplayChat}>
            <Center pr={4} pl={4} pt={4} pb={4}>
              {configData.result.chatbotDescription[0]}
            </Center>
            <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
              <iframe
                src={configData.URL.chatbot}
                width="100%"
                height="400px"
                onLoad={() => displayChat()}
              ></iframe>
            </Box>
          </Box>

          <Center pr={4} pl={4} pb={4}>
            {configData.result.questionnaireDescription[0]}
          </Center>

          <Center pr={4} pl={4} pb={4}>
            {/* When returning to this calculation result page from the questionnaire form on a PC browser (Chrome, Edge) deployed by Netlify, it will be 404, so open it in a new tab */}
            <Button
              as="a"
              href={configData.URL.questionnaire_form}
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="2em"
              width="100%"
              bg="cyan.600"
              color="white"
              _hover={{ bg: 'cyan.700' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              アンケートに答える
            </Button>
          </Center>
        </>
      )}
    </div>
  );
};

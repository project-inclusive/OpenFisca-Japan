import { useRef, useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Center, Button, Spinner, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import * as htmlToImage from 'html-to-image';

import configData from '../../config/app_config.json';
import { useCalculate } from '../../hooks/calculate';
import { Benefit } from './benefit';
import { Loan } from './loan';
import { CalculationLabel } from '../forms/calculationLabel';
import { householdAtom } from '../../state';
import { useRecoilState } from 'recoil';
import shortLink, {
  inflate,
  calculationType,
  getShareLink,
  getShareKey,
} from './shareLink';
import { QRCodeCanvas } from 'qrcode.react';

const createFileName = (extension: string = '', ...names: string[]) => {
  if (!extension) {
    return '';
  }

  return `${names.join('')}.${extension}`;
};

export const Result = () => {
  const location = useLocation();

  const { isSimpleCalculation, isDisasterCalculation } =
    location.state ?? calculationType();

  const navigate = useNavigate();

  const errorRedirect = () => {
    navigate('/response-error', {
      state: {
        isSimpleCalculation: isSimpleCalculation,
        isDisasterCalculation: isDisasterCalculation,
        redirect: '/',
      },
    });
  };

  const [household, setHousehold] = useRecoilState(householdAtom);
  let householdByURL: any;

  const [result, calculate] = useCalculate();
  const [isDisplayChat, setIsDisplayChat] = useState('none');
  const [shareLink, setShareLink] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const key = getShareKey();
    const required = resuiredHousehold(household);
    if (!required && key) {
      try {
        // URLパラメータから受け取った圧縮されたデータを展開
        setShareUrl(getShareLink(key));
        householdByURL = JSON.parse(inflate(key));
        setHousehold(householdByURL);
      } catch (error) {
        console.error('Failed to inflate shared data:', error);
        errorRedirect();
      }
    }
  }, []);

  let calcOnce = true;
  useEffect(() => {
    if (calcOnce) {
      // URLからhouseholdが展開された場合はそのhousehold, そうでない場合はフォームで入力されたhouseholdをPOST
      calculate(householdByURL || household).catch((e: any) => {
        console.log(e);

        // 想定外のエラーレスポンスを受け取り結果が取得できなかった場合、エラー画面へ遷移
        errorRedirect();
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

  const displayChat = useCallback(async (sec: number = 5) => {
    const sleep = (second: number) =>
      new Promise((resolve) => setTimeout(resolve, second * 1000));

    // wait some seconds because the page is auto scrolled to chatbot
    // in first few seconds of chatbot preparation
    await sleep(sec);
    console.log('display chatbot');
    setIsDisplayChat('');
  }, []);

  const clipBoard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const shareLinkButton = () => {
    const url = shortLink(
      household,
      isSimpleCalculation,
      isDisasterCalculation
    );
    setShareUrl(url);
    clipBoard(url)
      .then(() => {
        setShareLink(true);
        setTimeout(() => {
          setShareLink(false);
        }, 3000);
      })
      .catch((e: any) => {
        console.error('Failed to copy text:', e);
      });
  };

  const resuiredHousehold = (household: any) => {
    if (typeof household !== 'object') {
      return false;
    }

    if (
      !household.世帯員.あなた.収入 ||
      !household.世帯一覧.世帯1.居住市区町村 ||
      !household.世帯一覧.世帯1.居住都道府県
    ) {
      return false;
    }

    return true;
  };

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
                : isDisasterCalculation
                ? configData.calculationForm.disasterCalculation
                : configData.calculationForm.detailedCalculation
            }
            colour={
              isSimpleCalculation
                ? 'teal'
                : isDisasterCalculation
                ? 'orange'
                : 'blue'
            }
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

          {/* 被災者支援制度モードは他の支援制度も探せるリンクを載せる */}
          {isDisasterCalculation && (
            <Center pr={4} pl={4} pb={2}>
              <Text color="blue.900">
                他にも被災者支援制度はあります。詳しくは協力プロジェクトの
                <Text as="span" color="blue">
                  <a
                    href={configData.URL.disaster_navi_sodegawara}
                    target="_blank"
                    rel="noreferrer"
                  >
                    災害支援ナビゲーター
                    <ExternalLinkIcon ml={1} mr={1} />
                  </a>
                </Text>
                (by Civic Tech Sodegaura)をご覧ください。
              </Text>
            </Center>
          )}

          <Center pr={4} pl={4} pb={2}>
            <Text color="blue.900">
              {configData.result.consultationDescription}
            </Text>
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

          <Center pr={4} pl={4} pb={4}>
            <Button
              onClick={() => shareLinkButton()}
              as="button"
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="2em"
              width="100%"
              bg="gray.500"
              color="white"
              _hover={{ bg: 'gray.600' }}
            >
              {shareLink
                ? configData.result.shareLinkButtonCopiedToClipboard
                : configData.result.shareLinkButtonText}
            </Button>
          </Center>

          {shareUrl && (
            <Box bg="white" borderRadius="xl" p={4} mb={4} ml={4} mr={4}>
              <Center>
                {/* QRコード表示部分 */}
                <QRCodeCanvas value={shareUrl} size={200} />
              </Center>
            </Box>
          )}

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
            {/* When returning to this calculation result page from the questionnaire form on a PC browser (Chrome, Edge) deployed by Cloudflare Pages, it will be 404, so open it in a new tab */}
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

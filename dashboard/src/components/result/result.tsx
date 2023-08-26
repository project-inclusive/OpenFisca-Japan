import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Center, Button, Spinner, Text, Tooltip } from "@chakra-ui/react";
import { InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useRef, useState, useEffect, useContext } from "react";
import * as htmlToImage from "html-to-image";

import configData from "../../config/app_config.json";
import { data as SocialWelfareData } from "../../config/社会福祉協議会";
import { CurrentDateContext } from "../../contexts/CurrentDateContext";
import { useCalculate } from "../../hooks/calculate";
import { Benefit } from "./benefit";
import { Loan } from "./loan";
import { CalculationLabel } from "../forms/calculationLabel";

const createFileName = (extension: string = "", ...names: string[]) => {
  if (!extension) {
    return "";
  }

  return `${names.join("")}.${extension}`;
};

export const Result = () => {
  const location = useLocation();
  // TODO: decode household from URL
  const { household, isSimpleCalculation } = location.state as {
    household: any;
    isSimpleCalculation: boolean;
  };

  const currentDate = useContext(CurrentDateContext);
  const [result, calculate] = useCalculate();

  let calcOnce = true;
  useEffect(() => {
    if (calcOnce) {
      calculate(household);
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
      throw new Error("Invalid element reference.");
    }
    const dataURI = await htmlToImage.toPng(node, {
      backgroundColor: "#C4F1F9",
    });
    return dataURI;
  };

  const download = (
    image: string,
    {
      name = "お金サポート_結果",
      extension = "png",
    }: { name?: string; extension?: string } = {}
  ): void => {
    const a = document.createElement("a");
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

  const prefecture = household.世帯.世帯1.居住都道府県[currentDate];

  const city = household.世帯.世帯1.居住市区町村[currentDate];
  
  const getSocialWelfareCouncilData = () => {
    if(prefecture === "東京都" && SocialWelfareData.東京都.hasOwnProperty(city)) {
      const { 施設名, 郵便番号, 所在地, 経度, 緯度, 座標系, 電話番号, WebサイトURL } = SocialWelfareData.東京都[city];

      return {
        施設名, 
        郵便番号, 
        所在地, 
        経度, 
        緯度, 
        座標系, 
        電話番号, 
        WebサイトURL,
        googleMapsURL: encodeURI(`https://www.google.com/maps/search/${施設名}+${所在地}`)
      }
    }

    return {
        施設名: null, 
        郵便番号: null, 
        所在地: null, 
        経度: null, 
        緯度: null, 
        座標系: null, 
        電話番号: null, 
        WebサイトURL: "",
        googleMapsURL: ""
      }
  }

  const aboutLink = {
    link: "https://www.zcwvc.net/about/list.html",
    title: "全国の社会福祉協議会一覧",
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
                : configData.calculationForm.detailedCalculation
            }
            colour={isSimpleCalculation ? "teal" : "blue"}
          />

          <Center
            fontSize={configData.style.subTitleFontSize}
            fontWeight="medium"
            mt={2}
            mb={2}
          >
            {configData.result.topDescription}
          </Center>

          <Benefit result={result} currentDate={currentDate} />
          <Loan result={result} currentDate={currentDate} />

          <Center pr={4} pl={4} pb={4}>
              <Text style={{color: "#1F3C58", fontSize: "24px", fontWeight: 600 }}>
                まずは近くの社会福祉協議会に相談してみませんか？
              </Text>
          </Center>
          <Center pr={4} pl={4} pb={4}>
              <Text style={{fontSize: "14px", fontWeight: 400 }}>
                きっとあなたの相談に寄り添ってくれるはずです!
                <Tooltip label='他の制度や関係する窓口を紹介してもらえる可能性もあります' >  
                  <InfoIcon style={{marginLeft: "6px", color: "#3182CE"}}/>
                </Tooltip>
              </Text>
          </Center>


          <Center pr={4} pl={4} pb={4}>
              <Box 
              style={{
                fontSize: "14px", 
                width:"100%",
                backgroundColor: "white",
                fontWeight: 400, 
                border: "1px solid black", 
                borderRadius: "6px",
                padding: "8px 12px" }}>
                {prefecture === "東京都" ? 

                <div>
                  {getSocialWelfareCouncilData().WebサイトURL ? 
                  <a href={getSocialWelfareCouncilData().WebサイトURL} style={{ color: "#0017C1", fontWeight: 600 }} 
                  target="_blank"
                  rel="noopener noreferrer">
                    {getSocialWelfareCouncilData().施設名}
                  </a> :
                  <Text style={{ fontWeight: 600 }}>{getSocialWelfareCouncilData().施設名}</Text>}
                <Text>〒{getSocialWelfareCouncilData().郵便番号}</Text>
                <a href={getSocialWelfareCouncilData().googleMapsURL} style={{ color: "#0017C1"}} 
                  target="_blank"
                  rel="noopener noreferrer">
                    地図を開く
                  <ExternalLinkIcon style={{ marginLeft: "6px" }} />
                </a>
                <br />
                <Text>
                  TEL: <a href={`tel:${getSocialWelfareCouncilData().電話番号}`} style={{ color: "#0017C1"}}>{getSocialWelfareCouncilData().電話番号}</a>
                </Text>
                </div> :
                <div>
                  <Text style={{ fontWeight: 600 }}>社会福祉協議会の調べ方</Text>
                <Text>下記のページからお住まいの社会福祉協議会を選択してください</Text>
                <a href={aboutLink.link} 
                style={{ color: "#0017C1"}} 
                target="_blank"
                  rel="noopener noreferrer">
                  {aboutLink.title}
                  <ExternalLinkIcon style={{ marginLeft: "6px" }} />
                </a>
                </div>
                }
              </Box>
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
                  _hover={{ bg: "blue.600" }}
                >
                  {configData.calculationForm.detailedCalculation}
                </Button>
              </Center>
            </>
          )}

          <Center pr={4} pl={4} pb={4}>
            <Button
              onClick={downloadScreenshot}
              loadingText={"読み込み中..."}
              isLoading={loadingScreenshotDownload}
              as="button"
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="2em"
              width="100%"
              bg="gray.500"
              color="white"
              _hover={{ bg: "gray.600" }}
            >
              {configData.result.screenshotButtonText}
            </Button>
          </Center>

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
              _hover={{ bg: "cyan.700" }}
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

import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Center, Button, Spinner, Text } from "@chakra-ui/react";
import { InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useRef, useState, useEffect, useContext } from "react";
import * as htmlToImage from "html-to-image";

import configData from "../../config/app_config.json";
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

  const mockData = {
    nameOfSocialWelfareCouncil: "新宿区社会福祉協議会",
    websiteurl: "https://www.shinjuku-shakyo.jp/",
    postcode: "160-8484",
    address: "新宿区歌舞伎町1-4-1",
    mapsLink: encodeURI(`https://google.com/maps/search/新宿区社会福祉協議会+新宿区歌舞伎町1-4-1`),
    telephone: "03-0209-1111"
  };

  const aboutLink = {
    link: "https://www.zcwvc.net/about/list.html",
    title: "全国の社会福祉協議会一覧",
  }

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
                <InfoIcon style={{marginLeft: "6px", color: "#3182CE"}}/>
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
                {household.世帯.世帯1.居住都道府県[currentDate] === "東京都" ? 

                <div>
                  {mockData.websiteurl ? 
                  <a href={mockData.websiteurl} style={{ color: "#0017C1", fontWeight: 600 }} 
                  target="_blank"
                  rel="noopener noreferrer">
                    {mockData.nameOfSocialWelfareCouncil}
                  </a> :
                  <Text style={{ fontWeight: 600 }}>{mockData.nameOfSocialWelfareCouncil}</Text>}
                <Text>〒{mockData.postcode}</Text>
                <a href={mockData.mapsLink} style={{ color: "#0017C1"}} 
                  target="_blank"
                  rel="noopener noreferrer">
                    地図を開く
                  <ExternalLinkIcon style={{ marginLeft: "6px" }} />
                </a>
                <br />
                <Text>
                  TEL: <a href={`tel:${mockData.telephone}`} style={{ color: "#0017C1"}}>{mockData.telephone}</a>
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

import { Link as RouterLink, useLocation } from "react-router-dom";
import { Center, Button, Spinner } from "@chakra-ui/react";
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

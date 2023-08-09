import { useLocation } from "react-router-dom";
import { Center, Button } from "@chakra-ui/react";
import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import configData from "../../config/app_config.json";
import { Benefit } from "./benefit";
import { Loan } from "./loan";

const createFileName = (extension = "", ...names:string[]) => {
  if (!extension) {
    return "";
  }

  return `${names.join("")}.${extension}`;
};

export const Result = () => {
  const location = useLocation();
  const { result, currentDate } = location.state as {
    result: any;
    currentDate: string;
  };

  const divRef = useRef<HTMLDivElement>(null);
  const [loadingScreenshotDownload, setLoadingScreenshotDownload] = useState(false);

  const takeScreenShot = async (node:HTMLDivElement | null) => {
    setLoadingScreenshotDownload(true);
    return node ? await htmlToImage.toJpeg(node, { backgroundColor: "white" }) : "";
  };

  const download = (image:string, { name = "img", extension = "jpg" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
    setLoadingScreenshotDownload(false)
  };

  const downloadScreenshot = () => divRef && takeScreenShot(divRef.current).then(download);

  return (
    <div ref={divRef}>
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
    </div>
  );
};

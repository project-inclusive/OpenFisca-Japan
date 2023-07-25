import { useContext, useEffect, useState } from "react";
import { Box, Center, Button } from "@chakra-ui/react";

import configData from "../../config/app_config.json";
import { useCalculate } from "../../hooks/calculate";
import { FormYou } from "./you";
import { FormSpouse } from "./spouse";
import { FormChildren } from "./children";
import { useValidate } from "../../hooks/validate";
import { ShowAlertMessageContext } from "../../contexts/ShowAlertMessageContext";
import { useNavigate } from "react-router-dom";
import { CurrentDateContext } from "../../contexts/CurrentDateContext";
import { FormParents } from "./parents";

export const FormContent = () => {
  const [result, calculate] = useCalculate();
  const [ShowAlertMessage, setShowAlertMessage] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const validated = useValidate();
  const navigate = useNavigate();
  const currentDate = useContext(CurrentDateContext);

  useEffect(() => {
    if (showResult && result) {
      // HACK: レスポンスを受け取ってからページ遷移（クリック時点で遷移するとresultの更新が反映されない）
      navigate("/result", {
        state: {
          result: result,
          currentDate: currentDate,
        },
      });
    }
  }, [result]);

  return (
    <ShowAlertMessageContext.Provider value={ShowAlertMessage}>
      <div>
        <Center
          fontSize={configData.style.subTitleFontSize}
          fontWeight="medium"
          mt={2}
          mb={2}
        >
          {configData.calculationForm.topDescription}
        </Center>

        <form>
          <FormYou />
          <FormSpouse />
          <FormChildren />
          <FormParents />
        </form>

        <Center pr={4} pl={4} pb={4}>
          <Button
            isLoading={loading}
            loadingText="計算する"
            fontSize={configData.style.subTitleFontSize}
            borderRadius="xl"
            height="2em"
            width="100%"
            bg="cyan.600"
            color="white"
            _hover={{ bg: "cyan.700" }}
            onClick={() => {
              // 必須項目が入力されていない場合、結果は表示されずトップへ戻る
              if (!validated) {
                setShowAlertMessage(true);
                scrollTo(0, 0);
                return;
              }
              setLoading(true);
              calculate();
              setShowResult(true);
            }}
          >
            計算する
          </Button>
        </Center>
      </div>
    </ShowAlertMessageContext.Provider>
  );
};

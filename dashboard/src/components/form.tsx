import { useContext, useEffect, useState } from "react";
import { Box, Center, Button } from "@chakra-ui/react";

import configData from "../app_config.json";
import { useCalculate } from "../hooks/calculate";
import { FormYou } from "./forms/you";
import { FormSpouse } from "./forms/spouse";
import { FormChildren } from "./forms/children";
import { useValidate } from "../hooks/validate";
import { ShowAlertMessageContext } from "../contexts/ShowAlertMessageContext";
import { useNavigate } from "react-router-dom";
import { CurrentDateContext } from "../contexts/CurrentDateContext";

export const OpenFiscaForm = () => {
  const [result, calculate] = useCalculate();
  const [ShowAlertMessage, setShowAlertMessage] = useState(false);
  const [showResult, setShowResult] = useState(false);
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
          mt="0.5em"
          mb="0.5em"
        >
          {configData.calculationForm.topDescription}
        </Center>

        <form>
          <FormYou />
          <FormSpouse />
          <FormChildren />
        </form>
        <button
          className="btn btn-primary mb-3"
          type="button"
          onClick={() => {
            // 必須項目が入力されていない場合、結果は表示されずトップへ戻る
            if (!validated) {
              setShowAlertMessage(true);
              scrollTo(0, 0);
              return;
            }
            calculate();
            setShowResult(true);
          }}
        >
          計算する
        </button>
      </div>
    </ShowAlertMessageContext.Provider>
  );
};

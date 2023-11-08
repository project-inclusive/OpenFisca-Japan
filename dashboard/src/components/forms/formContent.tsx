import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Center, Button } from "@chakra-ui/react";

import configData from "../../config/app_config.json";
import { ShowAlertMessageContext } from "../../contexts/ShowAlertMessageContext";
import { HouseholdContext } from "../../contexts/HouseholdContext";
import { useValidate } from "../../hooks/validate";
import { FormYou } from "./you";
import { FormSpouse } from "./spouse";
import { FormChildren } from "./children";
import { FormParents } from "./parents";
import { CalculationLabel } from "./calculationLabel";

export const FormContent = () => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === "/calculate-simple";

  const [ShowAlertMessage, setShowAlertMessage] = useState(false);
  const validated = useValidate();
  const navigate = useNavigate();
  const { household, setHousehold } = useContext(HouseholdContext);

  return (
    <ShowAlertMessageContext.Provider value={ShowAlertMessage}>
      <div>
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
              navigate("/result", {
                state: {
                  household: household,
                  isSimpleCalculation: isSimpleCalculation,
                },
              });
            }}
          >
            計算する
          </Button>
        </Center>
      </div>
    </ShowAlertMessageContext.Provider>
  );
};

import { useContext, useEffect, useState } from "react";
import { useCalculate } from "../hooks/calculate";
import { FormYou } from "./forms/you";
import { OpenFiscaResult } from "./result";
import { useValidate } from "../hooks/validate";
import { ShowAlertMessageContext } from "../contexts/ShowAlertMessageContext";
import { useNavigate } from "react-router-dom";
import { AllowanceContext } from "../contexts/AllowanceContext";

export const OpenFiscaForm = () => {
  const [result, calculate] = useCalculate();
  const [ShowAlertMessage, setShowAlertMessage] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const validated = useValidate();
  const navigate = useNavigate();
  const allowance = useContext(AllowanceContext);

  useEffect(() => {
    if (showResult && result) {
      // HACK: レスポンスを受け取ってからページ遷移（クリック時点で遷移するとresultの更新が反映されない）
      navigate("/result", {state: {result: result, allowance: allowance}})
    }
  }, [result]);

  return (
    <ShowAlertMessageContext.Provider value={ShowAlertMessage}>
      <div>
        <h1 className="mt-3">以下の項目を入力してください</h1>
        <hr />
        <h4 className="mb-4">
          <br></br>
          「計算する」ボタンを押すと受けられる支援、給付額が表示されます。
        </h4>
        <div>
          <form>
            <FormYou />
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
      </div>
    </ShowAlertMessageContext.Provider>
  );
};

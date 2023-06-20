import { useContext, useState } from "react";
import { useCalculate } from "../hooks/calculate";
import { FormYou } from "./forms/you";
import { OpenFiscaResult } from "./result";
import { useValidate } from "../hooks/validate";
import { ShowAlertMessageContext } from "../contexts/ShowAlertMessageContext";

export const OpenFiscaForm = () => {
  const [result, calculate] = useCalculate();
  const [showForm, setShowForm] = useState(true);
  const [ShowAlertMessage, setShowAlertMessage] = useState(false);
  const validated = useValidate();

  // はじめはフォーム画面のみ表示
  if (showForm) {
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
                setShowForm(false);
              }}
            >
              計算する
            </button>
          </div>
        </div>
      </ShowAlertMessageContext.Provider>
    );
  }

  // 計算が終わると結果のみ表示
  return (
    <div>
      <OpenFiscaResult result={result} />
      <button
        className="btn btn-primary mb-3"
        type="button"
        onClick={() => {
          calculate();
          setShowForm(true);
        }}
      >
        戻る
      </button>
    </div>
  );
};

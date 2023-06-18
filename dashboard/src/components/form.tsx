import { useState } from "react";
import { useCalculate } from "../hooks/calculate";
import { FormYou } from "./forms/you";
import { OpenFiscaResult } from "./result";

export const OpenFiscaForm = () => {
  const [result, calculate] = useCalculate();
  const [showForm, setShowForm] = useState(true);

  // はじめはフォーム画面のみ表示
  if (showForm) {
    return (
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
              calculate();
              setShowForm(false);
            }}
          >
            計算する
          </button>
        </div>
      </div>
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

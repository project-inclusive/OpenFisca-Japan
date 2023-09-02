import { useState } from "react";

import configData from "../config/app_config.json";

export const useCalculate = () => {
  const [result, setResult] = useState<any>();
  const apiURL =
    import.meta.env.MODE === "production"
      ? // configData.URL.OpenFisca_API.production // mainブランチマージ時にビルドされるバックエンドAPI。Cloud Run
        configData.URL.OpenFisca_API.dev // developブランチプッシュ時にビルドされるバックエンドAPI。Cloud Run
      : "http://localhost:50000";

  // HTTPリクエストを必要最小限にするため、明示的に関数を呼び出した時のみ結果を更新
  const calculate = async (household: any) => {
    if (!household) {
      return;
    }
    console.log(household); // debug log

    const newResultRes = await fetch(`${apiURL}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(household),
    });

    // NOTE: エラーレスポンスを受け取った場合resultの生成ができないため、例外を出し終了
    if (!newResultRes.ok) {
      const errBody = await newResultRes.text();
      const errMsg = `unexpected error response: status: ${newResultRes.status}, body: ${errBody}`
      console.log(errMsg); // debug log
      throw new Error(errMsg);
    }

    const newResultJson = await newResultRes.json();
    console.log(newResultJson); // debug log
    delete newResultJson.世帯.世帯1.自分一覧;
    delete newResultJson.世帯.世帯1.配偶者一覧;
    delete newResultJson.世帯.世帯1.親一覧;
    delete newResultJson.世帯.世帯1.子一覧;
    setResult(newResultJson);
  };

  return [result, calculate];
};

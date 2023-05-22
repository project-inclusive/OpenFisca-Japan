import { useContext, useState } from "react";
import { HouseholdContext } from "../contexts/HouseholdContext";
import { APIServerURLContext } from "../contexts/APIServerURLContext";

export const useCalculate = () => {
  const [result, setResult] = useState<any>();
  const { household } = useContext(HouseholdContext);
  const apiURL = useContext(APIServerURLContext);

  // HTTPリクエストを必要最小限にするため、明示的に関数を呼び出した時のみ結果を更新
  const calculate = async () => {
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
    const newResultJson = await newResultRes.json();
    console.log(newResultJson); // debug log
    delete newResultJson.世帯.世帯1.保護者一覧;
    delete newResultJson.世帯.世帯1.児童一覧;
    setResult(newResultJson);
  };

  return [result, calculate];
};

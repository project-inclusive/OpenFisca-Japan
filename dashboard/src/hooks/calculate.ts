import { useContext, useEffect, useState } from "react";
import { HouseholdContext } from "../contexts/HouseholdContext";
import { APIServerURLContext } from "../contexts/APIServerURLContext";

export const useCalculate = () => {
  const [result, setResult] = useState<any>();
  const { household } = useContext(HouseholdContext);
  const apiURL = useContext(APIServerURLContext);

  console.log(household);

  useEffect(() => {
    if (!household) {
      return;
    }
    (async () => {
      const newResultRes = await fetch(`${apiURL}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(household),
      });
      const newResultJson = await newResultRes.json();
      console.log(newResultJson);
      delete newResultJson.世帯.世帯1.保護者一覧;
      delete newResultJson.世帯.世帯1.児童一覧;
      setResult(newResultJson);
    })();
  }, [household]);

  return result;
};

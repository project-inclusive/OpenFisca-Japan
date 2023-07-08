import { useState } from "react";

import configData from "../app_config.json";
import { OpenFiscaForm } from "../components/form";
import { HouseholdContext } from "../contexts/HouseholdContext";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { APIServerURLContext } from "../contexts/APIServerURLContext";

function CaluculationForm() {
  // 日付は「YYYY-MM-DD」の桁数フォーマットでないとOpenFisca APIが正常動作しない
  const currentDate = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`;

  const lastYearDate = `${new Date().getFullYear() - 1}-${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-01`;

  const apiURL =
    import.meta.env.MODE === "production"
      ? configData.OpenFisca_API_URL // Cloud Run (developブランチプッシュ時にビルドされるバックエンドAPI。mainブランチデプロイとdevelopブランチデプロイを判別する方法は不明)
      : "http://localhost:50000";

  const [household, setHousehold] = useState({
    世帯員: {
      あなた: {
        誕生年月日: { ETERNITY: "" },
        収入: {
          [currentDate]: 0,
        },
        身体障害者手帳等級認定: { ETERNITY: "無" },
        // 身体障害者手帳交付年月日は入力作業を省略させるため昨年の日付を設定
        // (身体障害者手帳等級認定は身体障害者手帳交付年月日から2年以内が有効)
        身体障害者手帳交付年月日: { ETERNITY: lastYearDate },
        療育手帳等級: { ETERNITY: "無" },
        愛の手帳等級: { ETERNITY: "無" },
        精神障害者保健福祉手帳等級: { ETERNITY: "無" },
        内部障害: { ETERNITY: "無" },
        脳性まひ_進行性筋萎縮症: { ETERNITY: "無" },
      },
    },
    世帯: {
      世帯1: {
        保護者一覧: ["あなた"],
        配偶者がいるがひとり親に該当: {
          [currentDate]: null,
        },
        児童手当: {
          [currentDate]: null,
        },
        児童扶養手当_最大: {
          [currentDate]: null,
        },
        児童扶養手当_最小: {
          [currentDate]: null,
        },
        /* 児童育成手当は東京都のみの制度のため除外
        児童育成手当: {
          [currentDate]: null,
        },
        */
        特別児童扶養手当_最小: {
          [currentDate]: null,
        },
        特別児童扶養手当_最大: {
          [currentDate]: null,
        },
        /* 障害児童育成手当は東京都のみの制度のため除外
        障害児童育成手当: {
          [currentDate]: null,
        },
        */
        障害児福祉手当: {
          [currentDate]: null,
        },
      },
    },
  });
  const householdContextValue = {
    household,
    setHousehold,
  };

  return (
    <APIServerURLContext.Provider value={apiURL}>
      <CurrentDateContext.Provider value={currentDate}>
        <HouseholdContext.Provider value={householdContextValue}>
          <OpenFiscaForm />
        </HouseholdContext.Provider>
      </CurrentDateContext.Provider>
    </APIServerURLContext.Provider>
  );
}

export default CaluculationForm;

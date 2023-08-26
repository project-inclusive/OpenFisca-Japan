import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AbsoluteCenter } from "@chakra-ui/react";
import CaluculationForm from "./components/forms/caluculationForm";
import Description from "./components/Description";
import { Result } from "./components/result/result";
import { GenericError } from "./components/errors/GenericError";
import { NotFoundError } from "./components/errors/NotFoundError";
import { HouseholdContext } from "./contexts/HouseholdContext";
import { CurrentDateContext } from "./contexts/CurrentDateContext";


  const currentDate = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`;

  const defaultHouseholdValues = {
    世帯員: {
      あなた: {},
    },
    世帯: {
      世帯1: {
        自分一覧: ["あなた"],
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
        生活保護: {
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
        生活支援費: {
          [currentDate]: null,
        },
        一時生活再建費: {
          [currentDate]: null,
        },
        福祉費: {
          [currentDate]: null,
        },
        緊急小口資金: {
          [currentDate]: null,
        },
        /* 住宅入居費はチェックボックスを有効化するまで除外
        住宅入居費: {
          [currentDate]: null,
        },
        */
        教育支援費: {
          [currentDate]: null,
        },
        就学支度費: {
          [currentDate]: null,
        },
        不動産担保型生活資金: {
          [currentDate]: null,
        },
      },
    },
  };

function App() {

  // NOTE: 計算したい制度については、予めここに設定する必要がある
  const [household, setHousehold] = useState(defaultHouseholdValues);
  console.log("APP", household)
  const householdContextValue = {
    household,
    setHousehold,
  };

  useEffect(()=>{
    if(household.世帯.世帯1.hasOwnProperty("居住都道府県") ||
    household.世帯.世帯1.hasOwnProperty("居住市区町村") ||
    household.世帯員.あなた.hasOwnProperty("収入")) {
      setHousehold(
        {
          ...defaultHouseholdValues,
          ...household.世帯,
          ...household.世帯員,
        })
    }

  }, [])


  return (
    <AbsoluteCenter
      width={{
        base: "100%", // 0-48em
        sm: "100%", // 480px
        md: "80%", // 768px
        lg: "60%", // 992px
        xl: "50%", // 1280px
      }}
      axis="horizontal"
    >
      <HouseholdContext.Provider value={householdContextValue}>
      <CurrentDateContext.Provider value={currentDate}>
        <RouterProvider
          fallbackElement={<GenericError />}
          router={createBrowserRouter(
            [
              {
                path: "/",
                element: <Description />,
              },
              {
                path: "/calculate",
                element: <CaluculationForm />,
              },
              {
                path: "/calculate-simple",
                element: <CaluculationForm />,
              },
              {
                path: "/result",
                element: <Result />,
              },
              {
                path: "/*",
                element: <NotFoundError />,
              },
            ],
            {
              basename: import.meta.env.BASE_URL,
            }
          )}
        />
      </CurrentDateContext.Provider>
      </HouseholdContext.Provider>
    </AbsoluteCenter>
  );
}

export default App;

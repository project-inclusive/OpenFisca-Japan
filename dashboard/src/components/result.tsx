import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import configData from "../app_config.json";

export const OpenFiscaResult = () => {
  const location = useLocation();
  const { result, currentDate } = location.state as {
    result: any;
    currentDate: string;
  };

  const [totalAllowance, setTotalAllowance] = useState<string>("0");
  const [displayedResult, setDisplayedResult] = useState<any>();

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const minMaxResult: Obj = {};

    if (result) {
      for (const [allowanceName, allowanceInfo] of Object.entries(
        configData.result.給付制度.制度一覧
      )) {
        if (allowanceName in result.世帯.世帯1) {
          if (result.世帯.世帯1[allowanceName][currentDate] > 0) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              max: result.世帯.世帯1[allowanceName][currentDate],
              min: result.世帯.世帯1[allowanceName][currentDate],
              unit: allowanceInfo.unit,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
            };
          }
        } else if (`${allowanceName}_最大` in result.世帯.世帯1) {
          if (result.世帯.世帯1[`${allowanceName}_最大`][currentDate] > 0) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              max: result.世帯.世帯1[`${allowanceName}_最大`][currentDate],
              min: result.世帯.世帯1[`${allowanceName}_最小`][currentDate],
              unit: allowanceInfo.unit,
              caption: allowanceInfo.caption,
              reference: allowanceInfo.reference,
            };
          }
        }
      }

      let totalAllowanceMax = 0;
      let totalAllowanceMin = 0;
      for (const [key, value] of Object.entries(minMaxResult)) {
        totalAllowanceMax += value.max;
        totalAllowanceMin += value.min;

        if (value.max === value.min) {
          minMaxResult[key].displayedMoney = Number(value.max).toLocaleString();
        } else {
          // 最小額と最大額が異なる場合は「（最小額）〜（最大額）」の文字列を格納
          minMaxResult[key].displayedMoney = `${Number(
            value.min
          ).toLocaleString()}~${Number(value.max).toLocaleString()}`;
        }
      }

      // 合計額を格納
      if (totalAllowanceMax === totalAllowanceMin) {
        setTotalAllowance(totalAllowanceMax.toLocaleString());
      } else {
        setTotalAllowance(
          `${totalAllowanceMin.toLocaleString()}~${totalAllowanceMax.toLocaleString()}`
        );
      }

      setDisplayedResult(minMaxResult);
    }
  }, [result]);

  return (
    <div>
      <h1 className="mt-3">計算結果</h1>
      <hr />
      <div>
        <h2 id="calculate-result">給付されるお金</h2>
        {configData.result.給付制度.caption[0]}
        <ul className="list-group mb-3">
          <li
            key={-1}
            className="list-group-item list-group-item-secondary d-flex justify-content-between lh-sm"
          >
            <div>
              <h5 className="my-0">合計</h5>
            </div>
            <span className="text-muted">
              <h5 className="my-0">{totalAllowance} 円/月</h5>
            </span>
          </li>
          {displayedResult &&
            Object.values(displayedResult).map((val: any, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between lh-sm"
              >
                <div>
                  <h6 className="my-0">{val.name}</h6>
                  <small className="text-muted">
                    {val.caption[0]}
                    <br></br>
                    <a href={val.reference} target="_blank">
                      詳細リンク
                    </a>
                  </small>
                </div>
                <span className="text-muted">
                  {val.displayedMoney} {val.unit}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

import { useContext, useEffect, useState } from "react";
import { AllowanceContext } from "../contexts/AllowanceContext";

export const OpenFiscaResult = ({result}: {result: any}) => {
  const allowance = useContext(AllowanceContext);

  const [totalAllowance, setTotalAllowance] = useState<string>("0");
  const [displayedResult, setDisplayedResult] = useState<any>();

  interface Obj {
    [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
  }

  useEffect(() => {
    const minMaxResult: Obj = {};

    if (result && allowance) {
      for (const [key, value] of Object.entries(
        Object.entries(result.世帯.世帯1)
      )) {
        if (typeof value[1] === "object" && allowance.get(value[0])) {
          const dateValue = value[1] as { foo: unknown };

          // 手当の名称を取得
          let allowanceName = "";
          if (value[0].endsWith("_最大") || value[0].endsWith("_最小")) {
            allowanceName = value[0].substring(0, value[0].length - 3);
          } else {
            allowanceName = value[0];
          }

          // 手当の情報を格納
          if (!minMaxResult.hasOwnProperty(allowanceName)) {
            minMaxResult[allowanceName] = {
              name: allowanceName,
              allowanceDate: Object.keys(dateValue),
              description: allowance.get("linkPrefix"),
              reference: allowance.get(value[0]).references[0],
            };
          }

          if (value[0].endsWith("_最大")) {
            minMaxResult[allowanceName].max = Object.values(dateValue)[0];
          } else if (value[0].endsWith("_最大")) {
            minMaxResult[allowanceName].min = Object.values(dateValue)[0];
          } else {
            minMaxResult[allowanceName].max = Object.values(dateValue)[0];
            minMaxResult[allowanceName].min = Object.values(dateValue)[0];
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
        <h2 id="calculate-result">受けられる手当（月額）</h2>
        <ul className="list-group mb-3">
          <li
            key={-1}
            className="list-group-item list-group-item-secondary d-flex justify-content-between lh-sm"
          >
            <div>
              <h5 className="my-0">合計</h5>
            </div>
            <span className="text-muted">
              <h5 className="my-0">{totalAllowance} 円</h5>
            </span>
          </li>
          {displayedResult &&
            Object.values(displayedResult).map(
              (val: any, index) =>
                val.displayedMoney !== "0" && (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between lh-sm"
                  >
                    <div>
                      <h6 className="my-0">{val.name}</h6>
                      <small className="text-muted">
                        <a href={val.reference} target="_blank">
                          {val.description}
                        </a>
                      </small>
                    </div>
                    <span className="text-muted">{val.displayedMoney} 円</span>
                  </li>
                )
            )}
        </ul>
      </div>
    </div>
  );
};

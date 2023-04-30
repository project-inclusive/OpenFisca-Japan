import { useCallback, useContext, useState } from "react";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";
import { HouseholdContext } from "../../../contexts/HouseholdContext";

export const Income = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const { household, setHousehold } = useContext(HouseholdContext);

  const [shownIncome, setShownIncome] = useState<string | number>("");

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = {
      ...household,
    };

    // 「万円」単位を「円」に換算
    let income = parseInt(event.currentTarget.value) * 10000;
    // 正の整数以外は0に変換
    if (isNaN(income) || income < 0) {
      income = 0;
      setShownIncome("");
    } else {
      setShownIncome(income / 10000);
    }

    newHousehold.世帯員[personName].収入[currentDate] = income;
    setHousehold(newHousehold);
  }, []);

  return (
    /*
    <div className="input-group input-group-lg mb-3">
      <span className="input-group-text">年収</span>
      <input
        name="年収"
        className="form-control"
        type="number"
        value={shownIncome}
        onChange={onChange}
      />
      <span className="input-group-text">万円</span>
    </div>
    */
    <>
      <label>年収</label>
      <div className="row g-3 align-items-center mb-3">
        <div className="col-auto">
          <input
            name="年収"
            className="form-control"
            type="number"
            value={shownIncome}
            onChange={onChange}
          />
        </div>
        <div className="col-auto">
          <label className="col-form-label">万円</label>
        </div>
      </div>
    </>
  );
};

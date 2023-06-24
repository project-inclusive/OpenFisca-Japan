import { useState, useCallback, useContext, useMemo, useEffect } from "react";
import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { ErrorMessage } from "./validation/ErrorMessage";

export const Birthday = ({ personName }: { personName: string }) => {
  const { household, setHousehold } = useContext(HouseholdContext);

  const thisYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(NaN);
  const [selectedMonth, setSelectedMonth] = useState(NaN);
  const [selectedDate, setSelectedDate] = useState(NaN);

  // 年月日のドロップダウンリスト
  const yearArray = [...Array(thisYear - 1900)].map((_, i) =>
    String(thisYear - i)
  );
  const monthArray = [...Array(12)].map((_, i) => String(i + 1));

  // 月末の日付は年・月によって変わる
  const dateArray = useMemo(() => {
    if (isNaN(selectedYear) || isNaN(selectedMonth)) {
      return [...Array(31)].map((_, i) => String(i + 1));
    }
    const lastDate = new Date(selectedYear, selectedMonth, 1);
    lastDate.setDate(0);
    return [...Array(lastDate.getDate())].map((_, i) => String(i + 1));
  }, [selectedYear, selectedMonth]);

  const handleYearChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedYear(parseInt(event.currentTarget.value));
    },
    []
  );

  const handleMonthChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedMonth(parseInt(event.currentTarget.value));
    },
    []
  );

  const handleDateChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedDate(parseInt(event.currentTarget.value));
    },
    []
  );

  // 年月日が変更された時OpenFiscaの計算を行う
  useEffect(() => {
    let birthday;
    if (isNaN(selectedYear) || isNaN(selectedMonth) || isNaN(selectedDate)) {
      birthday = "";
    } else {
      // 年・月が変更され選択されていた日が月末より大きい場合、1日に変更
      // （例）2020年2月29日（閏年）から年を2021に変更した場合、GUIのフォームと内部状態は2021年2月1日に年と日を変更
      // 年・月が変更され選択されていた日が月末以下の場合、日は変更しない
      // （例）2020年2月15日から年を2021に変更した場合、GUIのフォームと内部状態は2021年2月15日に年のみ変更
      const lastDate = new Date(selectedYear, selectedMonth, 1); // 翌月
      lastDate.setDate(0); // 当月最終日
      if (selectedDate > lastDate.getDate()) {
        setSelectedDate(1);
      }

      birthday = `${selectedYear.toString().padStart(4, "0")}-${selectedMonth
        .toString()
        .padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`;
    }

    const newHousehold = {
      ...household,
    };
    newHousehold.世帯員[personName]["誕生年月日"].ETERNITY = birthday;
    setHousehold(newHousehold);
  }, [selectedYear, selectedMonth, selectedDate]);

  return (
    <>
      <ErrorMessage condition={isNaN(selectedYear) || isNaN(selectedMonth) || isNaN(selectedDate)} />
      <label>生年月日</label>
      <div className="row g-3 align-items-center mb-3">
        <div className="col-auto">
          <select className="form-select" onChange={(e) => handleYearChange(e)}>
            <option value={""} key={0}></option>
            {yearArray.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <label className="col-form-label">年</label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            onChange={(e) => handleMonthChange(e)}
          >
            <option value={""} key={0}></option>
            {monthArray.map((month) => (
              <option value={month} key={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <label className="col-form-label">月</label>
        </div>
        <div className="col-auto">
          <select className="form-select" onChange={(e) => handleDateChange(e)}>
            <option value={""} key={0}></option>
            {dateArray.map((date) => (
              <option value={date} key={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <label className="col-form-label">日</label>
        </div>
      </div>
    </>
  );
};

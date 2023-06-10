import { useContext, useState, useCallback } from "react";
import { HouseholdContext } from "../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../contexts/CurrentDateContext";
import { Birthday } from "./attributes/Birthday";
import { Income } from "./attributes/Income";
import { Disability } from "./attributes/Disability";
import { Student } from "./attributes/Student";

export const FormSpouse = () => {
  const currentDate = useContext(CurrentDateContext);
  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);
  const spouseName = "配偶者";

  const lastYearDate = `${new Date().getFullYear() - 1}-${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-01`;

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };

    if (!event.target.checked) {
      newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当[currentDate] = false;
    } else {
      newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当[currentDate] = true;
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      {household.世帯.世帯1.保護者一覧.includes(spouseName) && (
        <>
          <h3>配偶者について</h3>
          <Birthday personName={spouseName} />
          <Disability personName={spouseName} />
          <Student personName={spouseName} />
          <Income personName={spouseName} />

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isChecked}
              id="flexCheckDefault"
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              以下のいずれかに当てはまる
            </label>
          </div>
          <ul>
            <li>重度の障害がある</li>
            <li>生死が不明</li>
            <li>子を1年以上遺棄している</li>
            <li>裁判所からのDV保護命令を受けた</li>
            <li>法令により1年以上拘禁されている</li>
          </ul>
          <br></br>
        </>
      )}
    </>
  );
};

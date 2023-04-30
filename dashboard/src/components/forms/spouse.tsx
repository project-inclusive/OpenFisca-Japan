import { useContext, useState, useCallback } from "react";
import { HouseholdContext } from "../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../contexts/CurrentDateContext";
import { Birthday } from "./attributes/Birthday";
import { Income } from "./attributes/Income";
import { Disability } from "./attributes/Disability";

export const FormSpouse = () => {
  const currentDate = useContext(CurrentDateContext);
  const [isExistChecked, setIsExistChecked] = useState(false);
  const [isHitorioyaChecked, setIsHitorioyaChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);
  const spouseName = "配偶者";

  const lastYearDate = `${new Date().getFullYear() - 1}-${(
    new Date().getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-01`;

  // チェックボックスの値が変更された時
  const onExistChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newHousehold = { ...household };
      if (!event.target.checked) {
        delete newHousehold.世帯員[spouseName];
        newHousehold.世帯.世帯1.保護者一覧 = ["あなた"];
        newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当[currentDate] =
          false;
        setIsHitorioyaChecked(false);
      } else {
        newHousehold.世帯.世帯1.保護者一覧.push(spouseName);
        newHousehold.世帯員[spouseName] = {
          誕生年月日: { ETERNITY: "" },
          収入: { [currentDate]: 0 },
          身体障害者手帳等級認定: { ETERNITY: "無" },
          // 身体障害者手帳交付年月日は入力作業を省略させるため昨年の日付を設定
          // (身体障害者手帳等級認定は身体障害者手帳交付年月日から2年以内が有効)
          身体障害者手帳交付年月日: { ETERNITY: lastYearDate },
          愛の手帳等級: { ETERNITY: "無" },
          精神障害者保健福祉手帳等級: { ETERNITY: "無" },
          内部障害: { ETERNITY: "無" },
          脳性まひ_進行性筋萎縮症: { ETERNITY: "無" },
        };
      }

      setHousehold({ ...newHousehold });
      setIsExistChecked(event.target.checked);
    },
    []
  );

  // チェックボックスの値が変更された時
  const onHitorioyaChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newHousehold = { ...household };

      if (!event.target.checked) {
        newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当[currentDate] =
          false;
      } else {
        newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当[currentDate] =
          true;
      }

      setHousehold({ ...newHousehold });
      setIsHitorioyaChecked(event.target.checked);
    },
    []
  );

  return (
    <>
      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isExistChecked}
          id="flexCheckDefault"
          onChange={onExistChange}
        />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          配偶者がいる（事実婚の場合も含む）
        </label>
      </div>
      {isExistChecked && (
        <>
          <h3>配偶者について</h3>
          <Birthday personName={spouseName} />
          <Income personName={spouseName} />
          <Disability personName={spouseName} />

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isHitorioyaChecked}
              id="flexCheckDefault"
              onChange={onHitorioyaChange}
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
        </>
      )}

      <br></br>
    </>
  );
};

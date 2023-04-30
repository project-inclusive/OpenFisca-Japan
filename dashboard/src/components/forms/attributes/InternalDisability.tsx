import { useState, useCallback, useContext } from "react";
import { HouseholdContext } from "../../../contexts/HouseholdContext";

export const InternalDisability = ({ personName }: { personName: string }) => {
  const { household, setHousehold } = useContext(HouseholdContext);
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (event.target.checked) {
      newHousehold.世帯員[personName].内部障害.ETERNITY = "有";
    } else {
      newHousehold.世帯員[personName].内部障害.ETERNITY = "無";
    }

    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isChecked}
          id="flexCheckDefault"
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          内部障害がある
        </label>
      </div>
    </>
  );
};

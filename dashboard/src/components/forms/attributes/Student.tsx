import { useState, useCallback, useContext } from "react";
import { HouseholdContext } from "../../../contexts/HouseholdContext";
import { CurrentDateContext } from "../../../contexts/CurrentDateContext";

export const Student = ({ personName }: { personName: string }) => {
  const currentDate = useContext(CurrentDateContext);
  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHousehold = { ...household };
    if (!event.target.checked) {
      newHousehold.世帯員[personName].学生 = { [currentDate]: false };
    } else {
      newHousehold.世帯員[personName].学生 = { [currentDate]: true };
    }
    setHousehold({ ...newHousehold });
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isChecked}
          id="flexCheckDefault"
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          小・中・高校、大学、専門学校、職業訓練学校等の学生である
        </label>
      </div>
      <br></br>
    </>
  );
};

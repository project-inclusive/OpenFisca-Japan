import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';
import { useEffect } from 'react';

export const IndustrialAccident = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const selections = [
    {
      selection: '業務によって病気になった',
      enable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[personName].業務によって病気になった = {
          [currentDate]: true,
        };
        setHousehold(copiedHousehold);
      },
      disable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[personName].業務によって病気になった = {
          [currentDate]: false,
        };
        setHousehold(copiedHousehold);
      },
    },
    {
      selection: '業務によってけがをした',
      enable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[personName].業務によってけがをした = {
          [currentDate]: true,
        };
        setHousehold(copiedHousehold);
      },
      disable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[personName].業務によってけがをした = {
          [currentDate]: false,
        };
        setHousehold(copiedHousehold);
      },
    },
  ];

  // ページを開いたタイミングで情報をfalseで初期化（ボタンを押さない場合値を設定するタイミングがないため）
  useEffect(() => {
    const copiedHousehold = { ...household };
    if (
      !household.世帯員[personName].hasOwnProperty('業務によって病気になった')
    ) {
      copiedHousehold.世帯員[personName].業務によって病気になった = {
        [currentDate]: false,
      };
    }
    if (
      !household.世帯員[personName].hasOwnProperty('業務によってけがをした')
    ) {
      copiedHousehold.世帯員[personName].業務によってけがをした = {
        [currentDate]: false,
      };
    }
    setHousehold(copiedHousehold);
  }, [personName]);

  const defaultSelections = ({ household }: { household: any }) => {
    const disease = household.世帯員[personName]?.業務によって病気になった;
    const injury = household.世帯員[personName]?.業務によってけがをした;

    return {
      業務によって病気になった: disease ? disease[currentDate] : false,
      業務によってけがをした: injury ? injury[currentDate] : false,
    };
  };

  return (
    <MultipleSelectionQuestion
      title="業務によって病気やけがをしましたか？"
      selections={selections}
      defaultSelections={defaultSelections}
    />
  );
};

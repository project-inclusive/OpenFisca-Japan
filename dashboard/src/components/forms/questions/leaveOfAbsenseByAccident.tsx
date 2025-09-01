import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';
import { useEffect } from 'react';

export const LeaveOfAbsenseByAccident = ({
  personName,
}: {
  personName: string;
}) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  const selections = [
    {
      selection: '病気によって連続三日以上休業している',
      enable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[
          personName
        ].病気によって連続三日以上休業している = {
          [currentDate]: true,
        };
        setHousehold(copiedHousehold);
      },
      disable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[
          personName
        ].病気によって連続三日以上休業している = {
          [currentDate]: false,
        };
        setHousehold(copiedHousehold);
      },
    },
    {
      selection: 'けがによって連続三日以上休業している',
      enable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[
          personName
        ].けがによって連続三日以上休業している = {
          [currentDate]: true,
        };
        setHousehold(copiedHousehold);
      },
      disable: () => {
        const copiedHousehold = { ...household };
        copiedHousehold.世帯員[
          personName
        ].けがによって連続三日以上休業している = {
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
      !household.世帯員[personName].hasOwnProperty(
        '病気によって連続三日以上休業している'
      )
    ) {
      copiedHousehold.世帯員[personName].病気によって連続三日以上休業している =
        {
          [currentDate]: false,
        };
    }
    if (
      !household.世帯員[personName].hasOwnProperty(
        'けがによって連続三日以上休業している'
      )
    ) {
      copiedHousehold.世帯員[personName].けがによって連続三日以上休業している =
        {
          [currentDate]: false,
        };
    }
    setHousehold(copiedHousehold);
  }, [personName]);

  const defaultSelections = ({ household }: { household: any }) => {
    const disease =
      household.世帯員[personName].病気によって連続三日以上休業している;
    const injury =
      household.世帯員[personName].けがによって連続三日以上休業している;

    return {
      病気によって連続三日以上休業している: disease
        ? disease[currentDate]
        : false,
      けがによって連続三日以上休業している: injury
        ? injury[currentDate]
        : false,
    };
  };

  return (
    <MultipleSelectionQuestion
      title="病気やけがによって連続3日以上休業していますか？"
      selections={selections}
      defaultSelections={defaultSelections}
    />
  );
};

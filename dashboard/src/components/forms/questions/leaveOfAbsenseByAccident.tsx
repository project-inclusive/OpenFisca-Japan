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

  return (
    <MultipleSelectionQuestion
      title="病気やけがによって連続3日以上休業していますか？"
      selections={selections}
    />
  );
};

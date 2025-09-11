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

  return (
    <MultipleSelectionQuestion
      title="業務によって病気やけがをしましたか？"
      selections={selections}
    />
  );
};

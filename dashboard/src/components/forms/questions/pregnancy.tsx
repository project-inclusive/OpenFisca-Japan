import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { SelectionQuestion } from '../templates/selectionQuestion';

export const Pregnancy = ({ personName }: { personName: string }) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);

  // display: 画面表示に使用
  // value: OpenFisca APIに使用
  const items = [
    { display: '妊娠6ヵ月未満', value: '妊娠6ヵ月未満' },
    { display: '妊娠6ヵ月以上', value: '妊娠6ヵ月以上' },
    { display: '産後6ヵ月以内', value: '産後6ヵ月以内' },
    { display: 'いいえ', value: '無' },
  ];

  const selections = items.map((item) => {
    return {
      selection: item.display,
      onClick: () => {
        const newHousehold = { ...household };
        newHousehold.世帯員[personName].妊産婦 = {
          [currentDate]: item.value,
        };
        setHousehold({ ...newHousehold });
      },
    };
  });

  return (
    <SelectionQuestion
      title="妊娠中、または産後6ヵ月以内ですか？"
      selections={selections}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯員[personName].妊産婦
          ? items.find(
              (item) =>
                item.value === household.世帯員[personName].妊産婦[currentDate]
            )?.display ?? null
          : null
      }
    />
  );
};

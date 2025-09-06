import { useRecoilState, useRecoilValue } from 'recoil';
import { currentDateAtom, householdAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';

export const HemoPhiliaKind = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  // display: 画面表示に使用
  // value: OpenFisca APIに使用
  const selectionValues = [
    {
      display: '第I因子（フィブリノゲン）欠乏症',
      value: '血液凝固因子異常症_第I因子欠乏症',
    },
    {
      display: '第II因子（プロトロンビン）欠乏症',
      value: '血液凝固因子異常症_第II因子欠乏症',
    },
    {
      display: '第V因子（不安定因子）欠乏症',
      value: '血液凝固因子異常症_第V因子欠乏症',
    },
    {
      display: '第VII因子（安定因子）欠乏症',
      value: '血液凝固因子異常症_第VII因子欠乏症',
    },
    {
      display: '第VIII因子欠乏症（血友病A）',
      value: '血液凝固因子異常症_第VIII因子欠乏症',
    },
    {
      display: '第IX因子欠乏症（血友病B）',
      value: '血液凝固因子異常症_第IX因子欠乏症',
    },
    {
      display: '第X因子（スチュアートプラウア）欠乏症',
      value: '血液凝固因子異常症_第X因子欠乏症',
    },
    {
      display: '第XI因子（PTA）欠乏症',
      value: '血液凝固因子異常症_第XI因子欠乏症',
    },
    {
      display: '第XII因子（ヘイグマン因子）欠乏症',
      value: '血液凝固因子異常症_第XII因子欠乏症',
    },
    {
      display: '第XIII因子（フィブリン安定化因子）欠乏症',
      value: '血液凝固因子異常症_第XIII因子欠乏症',
    },
    {
      display: 'Von Willebrand（フォン・ヴィルブランド）病',
      value: '血液凝固因子異常症_フォンヴィルブランド病',
    },
    { display: 'わからない・その他', value: '血液凝固因子異常症_その他' },
  ];

  const selections = selectionValues.map((v) => ({
    selection: v.display,
    enable: () => {
      const copiedHousehold = { ...household };
      copiedHousehold.世帯員[personName][v.value] = {
        [currentDate]: true,
      };
      setHousehold(copiedHousehold);
    },
    disable: () => {
      const copiedHousehold = { ...household };
      copiedHousehold.世帯員[personName][v.value] = {
        [currentDate]: false,
      };
      setHousehold(copiedHousehold);
    },
  }));

  const defaultSelections = ({ household }: { household: any }) =>
    Object.fromEntries(
      selectionValues.map((v) => {
        const kind = household.世帯員[personName][v.value];
        return [v.display, kind ? kind[currentDate] : null];
      })
    );

  return (
    <MultipleSelectionQuestion
      title="血液凝固因子異常症のうち、当てはまるものはどれですか？"
      selections={selections}
      defaultSelections={defaultSelections}
    />
  );
};

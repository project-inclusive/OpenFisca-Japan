import { useRecoilState } from 'recoil';
import { frontendHouseholdAtom, nextQuestionKeyAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';
import { useEffect } from 'react';

export const SelfHealthConditionQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(
    frontendHouseholdAtom
  );

  const selectionValues = ['病気がある', 'けがをしている', '障害がある'];

  const selections = selectionValues.map((value) => ({
    selection: value,
    enable: () => {
      const copiedFrontendHousehold = { ...frontendHousehold };
      copiedFrontendHousehold.世帯員['あなた'][value] = true;
      setFrontendHousehold(copiedFrontendHousehold);
      updateNextQuestionKey(copiedFrontendHousehold);
    },
    disable: () => {
      const copiedFrontendHousehold = { ...frontendHousehold };
      copiedFrontendHousehold.世帯員['あなた'][value] = false;
      setFrontendHousehold(copiedFrontendHousehold);
      updateNextQuestionKey(copiedFrontendHousehold);
    },
  }));

  // 状態遷移先の質問を設定
  // HACK: 選択の組み合わせによって決定するため、enable, disableとは別の関数に切り出して処理
  const updateNextQuestionKey = (frontendHousehold: any) => {
    if (
      frontendHousehold.世帯員['あなた']['病気がある'] ||
      frontendHousehold.世帯員['あなた']['けがをしている']
    ) {
      // スキップしない
      return;
    }

    if (frontendHousehold.世帯員['あなた']['障害がある']) {
      // 病気、けがの質問を飛ばし障害の質問へ
      setNextQuestionKey({
        person: 'あなた',
        personNum: 0,
        title: '身体障害者手帳',
      });
      return;
    }

    // 病気、けが、障害の質問を飛ばす
    setNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: '介護施設',
    });
  };

  useEffect(() => {
    updateNextQuestionKey(frontendHousehold);
  }, [frontendHousehold]);

  const defaultSelections = ({
    household,
    frontendHousehold,
  }: {
    household: any;
    frontendHousehold: any;
  }) =>
    Object.fromEntries(
      selectionValues.map((value) => [
        value,
        frontendHousehold.世帯員['あなた'][value],
      ])
    );

  return (
    <MultipleSelectionQuestion
      title="病気やけが、障害はありますか？"
      selections={selections}
      defaultSelections={defaultSelections}
    />
  );
};

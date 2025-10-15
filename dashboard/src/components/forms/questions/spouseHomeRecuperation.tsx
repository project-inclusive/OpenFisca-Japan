import { useRecoilState } from 'recoil';
import { nextQuestionKeyAtom } from '../../../state';
import { HomeRecuperation } from './homeRecuperation';

export const SpouseHomeRecuperation = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  // 状態遷移先の質問を設定
  // HACK: 選択肢とは独立した条件式なので、enable, disableとは別の関数に切り出して処理
  const updateNextQuestionKey = (frontendHousehold: any) => {
    if (frontendHousehold.世帯員['配偶者']['病気がある']) {
      // スキップしない
      setNextQuestionKey(null);
      return;
    }

    if (frontendHousehold.世帯員['配偶者']['障害がある']) {
      // 病気の質問を飛ばす
      setNextQuestionKey({
        person: '配偶者',
        personNum: 0,
        title: '身体障害者手帳',
      });
      return;
    }

    // 病気と障害の質問を飛ばす
    setNextQuestionKey({
      person: '配偶者',
      personNum: 0,
      title: '介護施設',
    });
  };

  return (
    <HomeRecuperation
      personName={'配偶者'}
      updateNextQuestionKey={updateNextQuestionKey}
    />
  );
};

import { useRecoilState } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { nextQuestionKeyAtom } from '../../../state';

export const HousingDamageExistsQuestion = () => {
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);

  const yesOnClick = () => {};
  const noOnClick = () => {
    // 住宅被害の質問をスキップ
    setNextQuestionKey({
      person: 'あなた',
      personNum: 0,
      title: '家財の損害',
    });
  };

  return (
    <YesNoQuestion
      title="住宅が被害を受けていますか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
      defaultSelection={({ household }: { household: any }) =>
        household.世帯一覧.世帯1.住宅被害 ? true : null
      }
    />
  );
};

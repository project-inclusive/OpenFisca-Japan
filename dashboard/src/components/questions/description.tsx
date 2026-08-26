import { QuestionKey } from '../../state/questionDefinition';
import { SpouseExistsButSingleParent } from './descriptions/spouseExistsButSingleParent';

// 質問固有の補足事項
export const QuestionDescription = ({
  questionKey,
}: {
  questionKey: QuestionKey;
}) => {
  if (questionKey === '以下のいずれかに当てはまりますか？') {
    return <SpouseExistsButSingleParent />;
  }

  return <></>;
};

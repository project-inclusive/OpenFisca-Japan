import { Text } from '@chakra-ui/react';
import { questionValidatedAtom } from '../../../state';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';

export const QuestionDescription = ({
  description,
}: {
  description: string;
}) => {
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  useEffect(() => {
    // 入力しないためバリデーションチェックは無条件で許可
    setQuestionValidated(true);
  }, []);

  return <Text>{description}</Text>;
};

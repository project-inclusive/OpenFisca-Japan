import { Text } from '@chakra-ui/react';
import { questionValidatedAtom } from '../../../state';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import configData from '../../../config/app_config.json';

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

  return (
    <Text fontSize={configData.style.subTitleFontSize} textAlign="center">
      {description}
    </Text>
  );
};

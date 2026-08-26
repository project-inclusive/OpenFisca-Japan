import { Stack, Text } from '@chakra-ui/react';

import { PressedChoiceButton } from '../../forms/PressedChoiceButton';
import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ReferralHeader } from '../components/ReferralHeader';
import type { ReferralQuestion } from '../types';

type QuestionScreenProps = {
  question: ReferralQuestion;
  questionIndex: number;
  questionCount: number;
  selectedAnswerId?: string;
  onSelect: (answerId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export const QuestionScreen = ({
  question,
  questionIndex,
  questionCount,
  selectedAnswerId,
  onSelect,
  onBack,
  onNext,
}: QuestionScreenProps) => (
  <FlowShell
    header={<ReferralHeader />}
    progress={questionIndex + 1}
    maxProgress={questionCount}
    progressLabel={`質問 ${questionIndex + 1} / ${questionCount}`}
    title={
      <span id="referral-page-heading" tabIndex={-1}>
        質問 {questionIndex + 1} / {questionCount}
      </span>
    }
    navigation={
      <FlowNavigation
        onBack={onBack}
        onNext={onNext}
        nextDisabled={selectedAnswerId === undefined}
        nextLabel={
          questionIndex === questionCount - 1 ? '回答を確認する' : '次へ'
        }
        highContrast
      />
    }
  >
    <Stack as="fieldset" spacing={3} border="0" p={0} m={0} w="100%">
      <Text as="legend" fontWeight="bold" mb={1}>
        「{question.label}」について、もっとも近いものを選んでください。
      </Text>
      {question.answers.map((answer) => (
        <PressedChoiceButton
          key={answer.id}
          isPressed={selectedAnswerId === answer.id}
          highContrast
          onClick={() => onSelect(answer.id)}
          data-testid={`referral-answer-${answer.id}`}
          whiteSpace="normal"
          minH="3.5em"
          h="auto"
          py={3}
        >
          {answer.label}
        </PressedChoiceButton>
      ))}
    </Stack>
  </FlowShell>
);

import { Alert, AlertIcon, Box } from '@chakra-ui/react';
import { useEffect, useMemo, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import { getReferralAreaConfig } from './config';
import {
  clearReferralSession,
  loadReferralSession,
  useReferralSession,
} from './hooks/useReferralSession';
import {
  areAllQuestionsAnswered,
  createReferralDocument,
  deriveConcernCandidates,
  isValidReferralEmail,
} from './logic';
import { referralReducer } from './state';
import { AreaScreen } from './screens/AreaScreen';
import { ConcernScreen } from './screens/ConcernScreen';
import { DescriptionScreen } from './screens/DescriptionScreen';
import { DetailsScreen } from './screens/DetailsScreen';
import { NoConcernsScreen } from './screens/NoConcernsScreen';
import { NoticeScreen } from './screens/NoticeScreen';
import { OtherConcernScreen } from './screens/OtherConcernScreen';
import { QuestionScreen } from './screens/QuestionScreen';
import { ResultScreen } from './screens/ResultScreen';

import './print.css';

export const ReferralLetterPage = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    referralReducer,
    undefined,
    loadReferralSession
  );
  const { storageError } = useReferralSession(state);

  const areaConfig = state.areaId ? getReferralAreaConfig(state.areaId) : null;
  const candidates = useMemo(
    () => deriveConcernCandidates(state.areaId, state.answers),
    [state.areaId, state.answers]
  );
  const referralDocument = useMemo(
    () => createReferralDocument(state),
    [state]
  );

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      document.getElementById('referral-page-heading')?.focus();
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [state.step]);

  const restartAndReturnHome = () => {
    clearReferralSession();
    dispatch({ type: 'RESET' });
    navigate('/');
  };

  const renderStorageWarning = () =>
    storageError ? (
      <Box px={4} pt={2}>
        <Alert status="warning">
          <AlertIcon />
          {storageError}
        </Alert>
      </Box>
    ) : null;

  switch (state.step.kind) {
    case 'description':
      return (
        <Box as="main">
          {renderStorageWarning()}
          <DescriptionScreen
            onNext={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'notice' } })
            }
          />
        </Box>
      );

    case 'notice':
      return (
        <Box as="main">
          {renderStorageWarning()}
          <NoticeScreen
            accepted={state.noticeAccepted}
            onAcceptedChange={(accepted) =>
              dispatch({ type: 'SET_NOTICE_ACCEPTED', accepted })
            }
            onBack={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'description' } })
            }
            onNext={() => {
              if (state.noticeAccepted) {
                dispatch({ type: 'SET_STEP', step: { kind: 'area' } });
              }
            }}
          />
        </Box>
      );

    case 'area':
      return (
        <Box as="main">
          {renderStorageWarning()}
          <AreaScreen
            areaId={state.areaId}
            onSelect={(areaId) => dispatch({ type: 'SELECT_AREA', areaId })}
            onBack={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'notice' } })
            }
            onNext={() => {
              if (state.areaId !== null) {
                dispatch({
                  type: 'SET_STEP',
                  step: { kind: 'questions', questionIndex: 0 },
                });
              }
            }}
          />
        </Box>
      );

    case 'questions': {
      if (areaConfig === null) {
        return null;
      }

      const { questionIndex } = state.step;
      const question = areaConfig.questions[questionIndex];
      return (
        <Box as="main">
          {renderStorageWarning()}
          <QuestionScreen
            question={question}
            questionIndex={questionIndex}
            questionCount={areaConfig.questions.length}
            selectedAnswerId={state.answers[question.id]}
            onSelect={(answerId) =>
              dispatch({
                type: 'ANSWER_QUESTION',
                questionId: question.id,
                answerId,
              })
            }
            onBack={() =>
              dispatch({
                type: 'SET_STEP',
                step:
                  questionIndex === 0
                    ? { kind: 'area' }
                    : { kind: 'questions', questionIndex: questionIndex - 1 },
              })
            }
            onNext={() => {
              if (state.answers[question.id] === undefined) {
                return;
              }
              if (questionIndex < areaConfig.questions.length - 1) {
                dispatch({
                  type: 'SET_STEP',
                  step: { kind: 'questions', questionIndex: questionIndex + 1 },
                });
                return;
              }
              if (!areAllQuestionsAnswered(areaConfig.id, state.answers)) {
                return;
              }
              dispatch({
                type: 'SET_STEP',
                step:
                  candidates.length === 0
                    ? { kind: 'no-concerns' }
                    : { kind: 'concerns' },
              });
            }}
          />
        </Box>
      );
    }

    case 'no-concerns':
      return (
        <Box as="main">
          <NoConcernsScreen
            onBack={() =>
              dispatch({
                type: 'SET_STEP',
                step: { kind: 'questions', questionIndex: 6 },
              })
            }
            onReturnHome={restartAndReturnHome}
          />
        </Box>
      );

    case 'concerns':
      return (
        <Box as="main">
          {renderStorageWarning()}
          <ConcernScreen
            candidates={candidates}
            mainConcernId={state.mainConcernId}
            onSelectMain={(concernId) =>
              dispatch({ type: 'SELECT_MAIN_CONCERN', concernId })
            }
            onBack={() =>
              dispatch({
                type: 'SET_STEP',
                step: { kind: 'questions', questionIndex: 6 },
              })
            }
            onNext={() => {
              if (state.mainConcernId !== null) {
                dispatch({
                  type: 'SET_STEP',
                  step: { kind: 'other-concerns' },
                });
              }
            }}
          />
        </Box>
      );

    case 'other-concerns':
      if (state.mainConcernId === null) {
        return null;
      }
      return (
        <Box as="main">
          {renderStorageWarning()}
          <OtherConcernScreen
            candidates={candidates}
            mainConcernId={state.mainConcernId}
            otherConcernIds={state.otherConcernIds}
            onToggleOther={(concernId) =>
              dispatch({ type: 'TOGGLE_OTHER_CONCERN', concernId })
            }
            onBack={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'concerns' } })
            }
            onNext={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'details' } })
            }
          />
        </Box>
      );

    case 'details':
      return (
        <Box as="main">
          {renderStorageWarning()}
          <DetailsScreen
            inputs={state.inputs}
            onInput={(field, value) =>
              dispatch({ type: 'SET_INPUT', field, value })
            }
            onBack={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'other-concerns' } })
            }
            onNext={() => {
              if (isValidReferralEmail(state.inputs.email)) {
                dispatch({ type: 'SET_STEP', step: { kind: 'result' } });
              }
            }}
          />
        </Box>
      );

    case 'result':
      if (referralDocument === null) {
        return null;
      }
      return (
        <Box as="main">
          <ResultScreen
            document={referralDocument}
            storageError={storageError}
            onEdit={() =>
              dispatch({ type: 'SET_STEP', step: { kind: 'details' } })
            }
            onReset={restartAndReturnHome}
          />
        </Box>
      );
  }
};

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AbsoluteCenter } from '@chakra-ui/react';
import QuestionExamples from './components/QuestionExamples';
import PrivacyPolicy from './components/PrivacyPolicy';
import { Result } from './components/result/result';
import { GenericError } from './components/errors/GenericError';
import { NotFoundError } from './components/errors/NotFoundError';
import { FormResponseError } from './components/errors/FormResponseError';
import { useRecoilState } from 'recoil';
import { currentDateAtom } from './state';
import { DetailedQuestionList } from './components/forms/detailedQuestionList';
import { SimpleQuestionList } from './components/forms/simpleQuestionList';
import { DisasterQuestionList } from './components/forms/disasterQuestionList';
import { TopPage } from './components/top/topPage';
import { Question } from './components/questions/question';
import { questionStateMachine } from './state/questionState';
import { useMachine } from '@xstate/react';
import { useEffect } from 'react';

function App() {
  const currentDate = useRecoilState(currentDateAtom);

  useEffect(() => {
    // デバッグとして初回レンダリング時にのみ表示
    console.log(`deploy ${import.meta.env.VITE_BRANCH}`);
  }, []);

  // HACK: ページ遷移や戻るボタンによって質問の回答が消えないよう、xstateをここで初期化
  // TODO: ホームボタンを押したらリセットする
  const [questionState, send] = useMachine(questionStateMachine);

  return (
    <>
      <RouterProvider
        fallbackElement={<GenericError />}
        router={createBrowserRouter(
          [
            {
              path: '/',
              element: <TopPage />,
            },
            {
              path: '/calculate',
              element: <DetailedQuestionList />,
            },
            {
              path: '/calculate-simple',
              element: <SimpleQuestionList />,
            },
            {
              path: '/calculate-disaster',
              element: <DisasterQuestionList />,
            },
            {
              path: '/result',
              element: <Result />,
            },
            {
              path: '/question-examples',
              element: <QuestionExamples />,
            },
            {
              path: '/privacypolicy',
              element: <PrivacyPolicy />,
            },
            {
              path: '/response-error',
              element: <FormResponseError />,
            },
            {
              // TODO: 動作確認用なので移行が終わったら削除
              path: '/question-new',
              element: <Question state={questionState} send={send} />,
            },
            {
              path: '/*',
              element: <NotFoundError />,
            },
          ],
          {
            basename: import.meta.env.BASE_URL,
          }
        )}
      />
    </>
  );
}

export default App;

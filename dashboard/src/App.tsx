import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AbsoluteCenter } from '@chakra-ui/react';
import CaluculationForm from './components/forms/caluculationForm';
import Description from './components/Description';
import QuestionExamples from './components/QuestionExamples';
import PrivacyPolicy from './components/PrivacyPolicy';
import { Result } from './components/result/result';
import { GenericError } from './components/errors/GenericError';
import { NotFoundError } from './components/errors/NotFoundError';
import { FormResponseError } from './components/errors/FormResponseError';
import { useRecoilState } from 'recoil';
import { currentDateAtom } from './state';
import { QuestionForm } from './components/forms/questionForm';
import { DetailedQuestionList } from './components/forms/detailedQuestionList';
import { SimpleQuestionList } from './components/forms/simpleQuestionList';
import { DisasterQuestionList } from './components/forms/disasterQuestionList';

function App() {
  const currentDate = useRecoilState(currentDateAtom);

  console.log(`deploy ${import.meta.env.VITE_BRANCH}`);

  return (
    <AbsoluteCenter
      width={{
        base: '100%', // 0-48em
        sm: '100%', // 480px
        md: '80%', // 768px
        lg: '60%', // 992px
        xl: '50%', // 1280px
      }}
      axis="horizontal"
    >
      <RouterProvider
        fallbackElement={<GenericError />}
        router={createBrowserRouter(
          [
            {
              path: '/',
              element: <Description />,
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
            // TODO: 新UI確認用に追加したパス。移行が終わったら消す
            {
              path: '/dummy/question-form',
              element: <QuestionForm />,
            },
            // (ダミーここまで)
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
    </AbsoluteCenter>
  );
}

export default App;

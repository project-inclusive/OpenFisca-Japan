import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AbsoluteCenter } from '@chakra-ui/react';
import CaluculationForm from './components/forms/caluculationForm';
import Description from './components/Description';
import QuestionExamples from './components/QuestionExamples';
import { Result } from './components/result/result';
import { GenericError } from './components/errors/GenericError';
import { NotFoundError } from './components/errors/NotFoundError';
import { CurrentDateContext } from './contexts/CurrentDateContext';
import { FormResponseError } from './components/errors/FormResponseError';

function App() {
  const currentDate = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;

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
      <CurrentDateContext.Provider value={currentDate}>
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
                element: <CaluculationForm />,
              },
              {
                path: '/calculate-simple',
                element: <CaluculationForm />,
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
                path: '/response-error',
                element: <FormResponseError />,
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
      </CurrentDateContext.Provider>
    </AbsoluteCenter>
  );
}

export default App;

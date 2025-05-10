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
import { AgeQuestion } from './components/forms/templates/ageQuestion';
import { AddressQuestion } from './components/forms/templates/addressQuestion';
import { YesNoQuestion } from './components/forms/templates/yesNoQuestion';
import { SelectionQuestion } from './components/forms/templates/selectionQuestion';
import { IncomeQuestion } from './components/forms/templates/incomeQuestion';
import { ChildAgeQuestion } from './components/forms/templates/childAgeQuestion';
import { PersonNumQuestion } from './components/forms/templates/personNumQuestion';

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
              element: <CaluculationForm />,
            },
            {
              path: '/calculate-simple',
              element: <CaluculationForm />,
            },
            {
              path: '/calculate-disaster',
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
              path: '/privacypolicy',
              element: <PrivacyPolicy />,
            },
            {
              path: '/response-error',
              element: <FormResponseError />,
            },
            // TODO: 新UI確認用に追加したパス。移行が終わったら消す
            {
              path: '/dummy/age',
              element: <AgeQuestion personName="あなた" mustInput={true} />,
            },
            {
              path: '/dummy/address',
              element: <AddressQuestion mustInput={true} />,
            },
            {
              path: '/dummy/yesno',
              element: <YesNoQuestion mustInput={true} subtitle="○○ですか？" />,
            },
            {
              path: '/dummy/selection',
              element: (
                <SelectionQuestion
                  mustInput={true}
                  subtitle="通っている高校の種類は何ですか？"
                  selections={[
                    { selection: 'A', title: '公立' },
                    { selection: 'B', title: '私立' },
                    { selection: 'C', title: '国立' },
                  ]}
                />
              ),
            },
            {
              path: '/dummy/income',
              element: <IncomeQuestion personName="あなた" mustInput={true} />,
            },
            {
              path: '/dummy/child-age',
              element: (
                <ChildAgeQuestion personName="あなた" mustInput={true} />
              ),
            },
            {
              path: '/dummy/person-num',
              element: (
                <PersonNumQuestion
                  mustInput={true}
                  subtitle="子どもはいますか？"
                />
              ),
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

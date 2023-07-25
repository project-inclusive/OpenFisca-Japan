import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AbsoluteCenter } from "@chakra-ui/react";
import CaluculationForm from "./components/forms/caluculationForm";
import Description from "./components/Description";
import { Result } from "./components/result/result";
import { GenericError } from './components/errors/GenericError';
import { NotFoundError } from './components/errors/NotFoundError';

function App() {
  return (
    <AbsoluteCenter
      width={{
        base: "100%", // 0-48em
        sm: "100%", // 480px
        md: "80%", // 768px
        lg: "60%", // 992px
        xl: "50%", // 1280px
      }}
      axis="horizontal"
    >
      <RouterProvider
        fallbackElement={<GenericError />}
        router={createBrowserRouter(
          [
            {
              path: "/",
              element: <Description />,
            },
            {
              path: "/calculate",
              element: <CaluculationForm />,
            },
            {
              path: "/result",
              element: <Result />,
            },
            {
              path: "/*",
              element: <NotFoundError/>,
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

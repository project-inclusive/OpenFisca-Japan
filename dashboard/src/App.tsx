import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Box, AbsoluteCenter } from "@chakra-ui/react";
import CaluculationForm from "./pages/CaluculationForm";
import Description from "./pages/Description";
import { OpenFiscaResult } from "./components/result";

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
              element: <OpenFiscaResult />,
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

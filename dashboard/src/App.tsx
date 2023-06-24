import { createBrowserRouter, RouterProvider} from "react-router-dom";
import CaluculationForm from "./pages/CaluculationForm";
import Description from "./pages/Description";
import { OpenFiscaResult } from "./components/result";

function App() {
  return (
    <RouterProvider router={createBrowserRouter([
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
    ])} />
  );
}

export default App;

import { createBrowserRouter, RouterProvider} from "react-router-dom";
import CaluculationForm from "./pages/CaluculationForm";
import Description from "./pages/Description";

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
    ])} />
  );
}

export default App;

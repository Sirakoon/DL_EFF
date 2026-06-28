import { lazy, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import LayoutPage from "./components/shared/LayoutPage";
import Dashborad from "./components/pages/DashBorad";

const DashBorad = lazy(() => import("./components/pages/DashBorad"));

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPage />}>
          <Route index element={<Dashborad />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

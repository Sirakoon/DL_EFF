import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import LayoutPage from './components/shared/LayoutPage';

const Dashboard = lazy(() => import('./components/pages/Dashboard/index'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutPage />}>
          <Route index element={
            <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>}>
              <Dashboard />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

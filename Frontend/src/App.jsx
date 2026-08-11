import LayoutPage from './components/shared/LayoutPage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <LayoutPage />
    </AuthProvider>
  );
}

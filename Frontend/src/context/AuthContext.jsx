import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authLogin, authRegister, authMe, authForgotPassword, authChangePassword, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) { setReady(true); return; }
    authMe()
      .then((res) => setUser(res.user))
      .catch(() => setAuthToken(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authLogin({ username, password });
    setAuthToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback((username, password, role) => authRegister({ username, password, role }), []);

  const forgotPassword = useCallback((username, newPassword) => authForgotPassword(username, newPassword), []);

  const changePassword = useCallback((currentPassword, newPassword) => authChangePassword(currentPassword, newPassword), []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, forgotPassword, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoUsers } from '../data/demoData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('landrisk-user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('landrisk-user', JSON.stringify(user));
    else localStorage.removeItem('landrisk-user');
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAdmin: user?.role === 'ADMIN',
    login(email, password) {
      const enteredId = String(email || '').trim().toLowerCase();
      const enteredPassword = String(password || '').trim();
      const account = demoUsers.find((item) => {
        const ids = [item.email, ...(item.aliases || [])].map((value) => String(value).toLowerCase());
        return ids.includes(enteredId) && item.password === enteredPassword;
      });
      if (!account) throw new Error('Invalid demo credentials');
      setUser({ name: account.name, email: account.email, role: account.role });
    },
    logout() {
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

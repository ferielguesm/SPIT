import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spit_user')); }
    catch { return null; }
  });

  const login = (userData) => {
    localStorage.setItem('spit_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('spit_user');
    setUser(null);
  };

  // Admin: { id, email, fullName, role, type:'admin' }
  // Passenger: { id, firstName, lastName, email, nationality, age, travel, preferences, recommendations, type:'passenger' }
  const isAdmin     = user?.type === 'admin';
  const isPassenger = user?.type === 'passenger';
  const isLoggedIn  = !!user;

  // Works for both admin (user.id) and passenger (user.id)
  const userId      = user?.id;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isPassenger, isLoggedIn, userId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

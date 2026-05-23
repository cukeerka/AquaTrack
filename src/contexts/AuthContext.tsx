import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5055/api"; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Відновлення сесії при оновленні сторінки (щоб не викидало)
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (userId && username && role) {
      setUser({
        id: userId,
        name: username,
        email: '', 
        role: role.toLowerCase() === 'admin' ? 'admin' : 'user'
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const url = `${API_BASE_URL}/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await axios.post(url, null);

      // Зберігаємо в браузері
      localStorage.setItem("userId", response.data.UserId);
      localStorage.setItem("username", response.data.Username);
      localStorage.setItem("role", response.data.Role);

      // ОНОВЛЮЄМО СТАН REACT (це автоматично перемкне App.tsx на дашборд!)
      setUser({
        id: response.data.UserId.toString(),
        name: response.data.Username,
        email: email,
        role: response.data.Role.toLowerCase() === 'admin' ? 'admin' : 'user'
      });

      return true;
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const formData = { username: name, email: email, passwordHash: password };
      await axios.post(`${API_BASE_URL}/users/register`, formData);
      return true;
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null); // Це автоматично поверне на екран логіну
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
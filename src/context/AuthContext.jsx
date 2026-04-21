import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUserEmail, getUserData, LOGOUT } from "../config/apiService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmailState] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const email = getUserEmail();
    const userData = getUserData();
    if (token) {
      setIsAuthenticated(true);
      setUserEmailState(email || "Admin");
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    if (userData?.user) {
      setUser(userData.user);
      setUserEmailState(userData.user.email);
    } else if (userData?.User) {
      setUser(userData.User);
      setUserEmailState(userData.User.email);
    }
  };

  const logout = () => {
    LOGOUT();
    setIsAuthenticated(false);
    setUserEmailState("");
    setUser(null);
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-gray-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

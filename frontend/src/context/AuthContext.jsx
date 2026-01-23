import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  
  const loginAction = (userData) => {
    setUser(userData); 
  };

  const logout = async () => {
    try {
        await api.post("/auth/logout");
    } catch (e) {
        console.error(e);
    }
    setUser(null); // State clear
  };

  useEffect(() => {
    fetchUser();
  }, []);

  
  return (
    <AuthContext.Provider value={{ user, fetchUser, logout, loginAction, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout(); // No redirect here — App handles it
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      console.log("response :>> ", response);
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

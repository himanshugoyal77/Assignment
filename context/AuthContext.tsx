"use client";
import { createContext, useState, ReactNode, useEffect } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  toggle: () => {},
});

const getFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const value = localStorage.getItem("isLoggedIn");
    return value || false;
  }
};
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return getFromLocalStorage() === "true" ? true : false || false;
  });

  const toggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  useEffect(() => {
    localStorage.setItem("isLoggendIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, toggle }}>
      {children}
    </AuthContext.Provider>
  );
};

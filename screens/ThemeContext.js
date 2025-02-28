import React, { createContext, useState, useEffect } from "react";
import { Appearance, useColorScheme } from "react-native";

const ThemeContext = createContext();

const lightTheme = {
  background: "#ffffff",
  text: "#000000",
  buttonBackground: "#007bff",
  buttonText: "#ffffff",
};

const darkTheme = {
  background: "#000000",
  text: "#ffffff",
  buttonBackground: "#007bff",
  buttonText: "#ffffff",
};

const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === "dark" ? darkTheme : lightTheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === "dark" ? darkTheme : lightTheme);
    });

    return () => subscription.remove();
  }, []);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export { ThemeContext, ThemeProvider };
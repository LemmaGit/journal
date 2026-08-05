import { useState, useEffect } from "react";

export const useTheme = (initialTheme: "light" | "dark" = "light") => {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return { theme, toggleTheme, setTheme };
};

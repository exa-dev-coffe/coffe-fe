import {useState} from "react";
import ThemeContext from "./ThemeContext.ts";

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [theme, setTheme] = useState<"light" | "dark">(localStorage.getItem("theme") === "dark" ? "dark" : "light");

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
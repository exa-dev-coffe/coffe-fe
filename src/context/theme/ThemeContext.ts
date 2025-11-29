import {createContext} from "react";


interface ThemeContext {
    theme: "light" | "dark";
    setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

const ThemeContext = createContext<ThemeContext | null>(null);

export default ThemeContext;
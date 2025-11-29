import {useContext, useEffect} from "react";
import ThemeContext from "../context/theme/ThemeContext.ts";

const useThemeContext = () => {
    const theme = useContext(ThemeContext)
    if (!theme) {
        throw new Error("useThemeContext must be used within a AuthProvider");
    }

    const toggleTheme = () => {
        theme.setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        // Ambil dari localStorage saat pertama render
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark" || savedTheme === "light") {

            theme.setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // Update localStorage setiap theme berubah
        if (theme.theme) {

            localStorage.setItem("theme", theme.theme);

            // Optional: update class html (buat Tailwind)
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(theme.theme);
        }
    }, [theme.theme]);

    return {
        theme: theme.theme,
        toggleTheme,
    }
}

export default useThemeContext;
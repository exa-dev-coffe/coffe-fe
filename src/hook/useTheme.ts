import {useEffect, useState} from "react";

export default function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        // Ambil dari localStorage saat pertama render
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark" || savedTheme === "light") {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // Update localStorage setiap theme berubah
        localStorage.setItem("theme", theme);

        // Optional: update class html (buat Tailwind)
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
    }, [theme]);

    return {theme, toggleTheme};
}

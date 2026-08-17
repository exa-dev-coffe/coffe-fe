import "@/App.css";
import {BrowserRouter} from "react-router";
import AppProviders from "@/app/providers/AppProviders.tsx";
import AppRouter from "@/app/router/index.tsx";

export function App() {
    return (
        <BrowserRouter>
            <AppProviders>
                <AppRouter />
            </AppProviders>
        </BrowserRouter>
    );
}

export default App;

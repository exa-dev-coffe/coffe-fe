import {type BodyRegister, RegisterSchema} from "../model/auth.ts";
import {useState} from "react";
import {validate} from "../utils";
import {ZodError} from "zod";

const useAuth = () => {
    const [error, setError] = useState<BodyRegister>({
        email: "",
        password: "",
        full_name: "",
        confirmPassword: "",
    });

    const register = async (data: BodyRegister) => {
        try {
            validate(data, RegisterSchema);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMapData: Partial<Record<keyof BodyRegister, string>> = {
                    email: "",
                    password: "",
                    full_name: "",
                    confirmPassword: "",
                }

                error.issues.forEach(
                    (issue) => {
                        if (issue.path.length > 0) {
                            const key = issue.path[0] as keyof BodyRegister;
                            errorMapData[key] = issue.message;
                        }
                    }
                )

                console.log(errorMapData);
                throw error;
            }

        }
    }

    return {
        register
    }
}

export default useAuth;


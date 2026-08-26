import {ZodError, type ZodType} from "zod";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export const validate = (data: unknown, schema: ZodType) => {
    return schema.parse(data);
};

export const formatErrorZod = <T>(error: ZodError): FormErrors<T> => {
    const errorMapData: FormErrors<T> = {};
    error.issues.forEach((err) => {
        if (err.path.length > 0) {
            const key = err.path[0] as keyof T;
            errorMapData[key] = err.message;
        }
    });
    return errorMapData;
};

export const extractFormErrors = <T>(error: unknown): FormErrors<T> => {
    if (error && typeof error === "object" && !(error instanceof Error)) {
        return error as FormErrors<T>;
    }
    return {};
};

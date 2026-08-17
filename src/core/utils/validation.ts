import {ZodError, type ZodType} from "zod";

export const validate = (data: unknown, schema: ZodType) => {
    return schema.parse(data);
};

export const formatErrorZod = <T>(error: ZodError): Partial<Record<keyof T, string>> => {
    const errorMapData: Partial<Record<keyof T, string>> = {};
    error.issues.forEach((err) => {
        if (err.path.length > 0) {
            const key = err.path[0] as keyof T;
            errorMapData[key] = err.message;
        }
    });
    return errorMapData;
};

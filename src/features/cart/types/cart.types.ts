import {z} from "zod";

export const CheckoutPayloadSchema = z.object({
    pin: z.string().length(6, "PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
    orderFor: z.string().min(1, "Order name is required"),
    tableId: z.number().min(1, "Table selection is required"),
    datas: z.array(
        z.object({
            menuId: z.number(),
            qty: z.number().min(1),
            notes: z.string().optional(),
        })
    ).min(1, "At least 1 item is required for checkout"),
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;

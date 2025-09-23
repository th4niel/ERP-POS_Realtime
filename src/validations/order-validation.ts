import z from "zod";

export const orderFormSchema = z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    table_id: z.string().min(1, 'Select a table'),
    status: z.string().min(1, 'Select a status'),
});

export type OrderForm = z.infer<typeof orderFormSchema>;
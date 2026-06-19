import { z } from "zod";

export const applicationSchema = z.object({
    company: z.string().min(1, "Company is required"),
    role: z.string().min(1, "Role is required"),
    status: z.string().default("Applied"),
    appliedDate: z.string().min(1, "Applied date is required"),
    notes: z.string().default(""),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
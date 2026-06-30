import z from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name must be at most 64 characters"),
  identifier: z
    .string()
    .min(2, "Identifier must be at least 2 characters")
    .max(6, "Identifier must be at most 6 characters")
    .regex(/^[A-Za-z0-9]+$/, "Identifier must be letters and numbers only")
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .max(512, "Description must be at most 512 characters")
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  description: z.string().max(512).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "PAUSED"]).optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

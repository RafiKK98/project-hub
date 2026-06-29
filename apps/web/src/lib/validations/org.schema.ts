import { z } from "zod";

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name must be at most 64 characters"),
  description: z
    .string()
    .max(512, "Description must be at most 512 characters")
    .optional(),
});

export const updateOrgSchema = createOrgSchema.partial();

export const inviteMemberSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "DEVELOPER", "REPORTER", "GUEST"]),
});

export type CreateOrgFormValues = z.infer<typeof createOrgSchema>;
export type UpdateOrgFormValues = z.infer<typeof updateOrgSchema>;
export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

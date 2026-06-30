import { z } from "zod";

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(256, "Title must be at most 256 characters"),
  description: z.string().max(10000).optional(),
  priority: z
    .enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export type CreateIssueFormValues = z.infer<typeof createIssueSchema>;

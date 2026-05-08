import { z } from "zod";

export const roleCreateSchema = z.object({
  name: z.string().trim().min(1),
  permissions: z.record(z.string(), z.array(z.string())),
});

export const roleUpdateSchema = z.object({
  permissions: z.record(z.string(), z.array(z.string())),
});

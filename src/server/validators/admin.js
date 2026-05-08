import { z } from "zod";

const status = z.enum(["active", "inactive", "blocked", "suspended"]);

export const updateUserStatusSchema = z.object({ status });
export const updateBusinessStatusSchema = z.object({ status });
export const toggleAutoApproveSchema = z.object({
  autoApprovePromotions: z.boolean(),
});
export const changePromotionStatusSchema = z.object({
  status: z.enum(["inactive", "pending"]),
});
export const createAdminUserSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.string().uuid().optional().nullable(),
  isSuperAdmin: z.boolean().optional(),
});
export const updateAdminRoleSchema = z.object({
  roleId: z.string().uuid().optional().nullable(),
  isSuperAdmin: z.boolean().optional(),
});
export const makeAdminSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

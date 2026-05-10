import { z } from "zod";

export const userRegistrationSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const businessRegistrationSchema = z.object({
  name: z.string().trim().min(1, "Business name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional().default(""),
  categories: z.array(z.string()).min(1).max(2).optional(),
  personName: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  type: z.enum(["user", "business", "admin"]).optional(),
});

import { z } from "zod";

export const createSubscriptionCheckoutSchema = z.object({
  templateId: z.string().uuid(),
});

export const createSubscriptionTemplateSchema = z.object({
  name: z.string().min(1),
  durationMonths: z.number().int().positive(),
  price: z.number().nonnegative(),
  freeCities: z.number().int().nonnegative().optional(),
  freeStates: z.number().int().nonnegative().optional(),
  freeTimezones: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

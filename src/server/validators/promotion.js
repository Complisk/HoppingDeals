import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export const promotionCreateSchema = z.object({
  templateId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().trim().min(1, "Image URL is required"),
  text: z.any().optional(),
  backgroundColor: z.string().optional(),
  category: z.string().optional().nullable(),
  cities: z.array(z.any()).optional().default([]),
  states: z.array(z.any()).optional().default([]),
  timezones: z.array(z.string()).optional().default([]),
  runDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  stopDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  runTime: z.string().regex(timeRegex, "Valid run time is required (HH:MM)"),
  stopTime: z.string().regex(timeRegex, "Valid stop time is required (HH:MM)"),
});

export const promotionUpdateSchema = z.object({
  imageUrl: z.string().optional(),
  text: z.any().optional(),
  backgroundColor: z.string().optional(),
  runTime: z.string().regex(timeRegex).optional(),
  stopTime: z.string().regex(timeRegex).optional(),
});

export const promotionPriceSchema = z.object({
  runDate: z.string(),
  stopDate: z.string(),
  runTime: z.string().optional(),
  stopTime: z.string().optional(),
  cities: z.array(z.any()).optional().default([]),
  states: z.array(z.any()).optional().default([]),
  timezones: z.array(z.string()).optional().default([]),
  businessType: z
    .enum(["small", "medium", "large", "online-ecommerce"])
    .optional(),
});

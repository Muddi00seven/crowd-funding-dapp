import { z } from 'zod'

export const contributeSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Enter a valid number"
    })
    .refine((val) => parseFloat(val) >= 1, {
      message: "Minimum contribution is 1 USDT"
    })
    .refine((val) => parseFloat(val) <= 100000, {
      message: "Maximum 100,000 USDT per transaction"
    }),
})

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title is too long (max 100 chars)"),
  description: z
    .string()
    .min(20, "Please provide more detail (min 20 chars)")
    .max(1000, "Description is too long (max 1000 chars)"),
  goalUsdt: z
    .string()
    .refine((val) => parseFloat(val) >= 1, {
      message: "Goal must be at least 1 USDT"
    })
    .refine((val) => parseFloat(val) <= 10000000, {
      message: "Goal cannot exceed 10,000,000 USDT"
    }),
  durationDays: z
    .number()
    .min(1, "Campaign must run for at least 1 day")
    .max(365, "Maximum duration is 365 days"),
})

export type ContributeFormData = z.infer<typeof contributeSchema>
export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>

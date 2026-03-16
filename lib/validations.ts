import { z } from 'zod'

export const contributeSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount likhna zaroori hai")
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Valid number dalo"
    })
    .refine((val) => parseFloat(val) >= 0.001, {
      message: "Minimum 0.001 ETH contribute kar sakte ho"
    })
    .refine((val) => parseFloat(val) <= 100, {
      message: "Maximum 100 ETH ek transaction mein"
    }),
})

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(5, "Title kam se kam 5 characters ka hona chahiye")
    .max(100, "Title zyada lamba hai (max 100 chars)"),
  description: z
    .string()
    .min(20, "Description mein zyada detail dalo (min 20 chars)")
    .max(1000, "Description zyada lamba hai (max 1000 chars)"),
  goalEth: z
    .string()
    .refine((val) => parseFloat(val) >= 0.01, {
      message: "Goal kam se kam 0.01 ETH hona chahiye"
    })
    .refine((val) => parseFloat(val) <= 10000, {
      message: "Goal zyada zyada nahi ho sakta (max 10,000 ETH)"
    }),
  durationDays: z
    .number()
    .min(1, "Minimum 1 din ka campaign hona chahiye")
    .max(365, "Maximum 365 din"),
})

export type ContributeFormData = z.infer<typeof contributeSchema>
export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>

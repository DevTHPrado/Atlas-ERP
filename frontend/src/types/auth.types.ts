import { z } from "zod";

export const authenticatedUserSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  permissions: z.array(z.string()),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in_minutes: z.number(),
  user: authenticatedUserSchema,
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

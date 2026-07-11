import { z } from "zod";

export const dashboardSchema = z.object({
  kpis: z.object({
    revenue: z.string().or(z.number()),
    profit: z.string().or(z.number()),
    active_customers: z.number(),
    overdue_accounts: z.string().or(z.number()),
    upcoming_accounts: z.string().or(z.number()),
    out_of_stock_products: z.number(),
  }),
  cash_flow: z.array(z.object({ label: z.string(), value: z.string().or(z.number()) })),
  top_products: z.array(z.object({ label: z.string(), value: z.string().or(z.number()) })),
});

export type Dashboard = z.infer<typeof dashboardSchema>;

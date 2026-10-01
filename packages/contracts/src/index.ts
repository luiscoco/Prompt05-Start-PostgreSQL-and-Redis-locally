import { z } from 'zod';

export const correlationIdSchema = z.uuid();
export const ERROR_CODES = ['BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'INTERNAL_ERROR', 'CONFIGURATION_ERROR'] as const;
export const errorCodeSchema = z.enum(ERROR_CODES);
export const errorEnvelopeSchema = z.object({
  error: z.object({ code: errorCodeSchema, message: z.string().min(1), requestId: correlationIdSchema })
});
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
export const REQUEST_ID_HEADER = 'x-request-id' as const;
export const HEALTH_STATUS = 'ok' as const;
export const healthResponseSchema = z.object({ status: z.literal(HEALTH_STATUS), requestId: correlationIdSchema });
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export const demoAskRequestSchema = z.object({ question: z.string().trim().min(1).max(500) }).strict();
export const demoAskResponseSchema = z.object({ answer: z.string().min(1), mode: z.enum(['mock', 'claude']), requestId: correlationIdSchema });
export type DemoAskRequest = z.infer<typeof demoAskRequestSchema>;
export type DemoAskResponse = z.infer<typeof demoAskResponseSchema>;

// Browser-safe read models. Financial values stay decimal strings; the server will
// calculate them when portfolio APIs arrive in later milestones.
export const holdingDtoSchema = z.object({
  symbol: z.string(), name: z.string(), sector: z.string(), shares: z.string(),
  price: z.string(), marketValue: z.string(), dayChangePercent: z.string(),
  allocationPercent: z.string(), trend: z.enum(['up', 'down', 'flat'])
});
export type HoldingDto = z.infer<typeof holdingDtoSchema>;
export const portfolioDtoSchema = z.object({
  id: z.string(), name: z.string(), accountLabel: z.string(),
  totalValue: z.string(), dayChange: z.string(), dayChangePercent: z.string(),
  totalReturn: z.string(), totalReturnPercent: z.string(), cashBalance: z.string(),
  holdings: z.array(holdingDtoSchema), asOf: z.string(), isDemo: z.boolean()
});
export type PortfolioDto = z.infer<typeof portfolioDtoSchema>;
export const newsItemDtoSchema = z.object({
  id: z.string(), category: z.string(), title: z.string(), summary: z.string(),
  source: z.string(), publishedAt: z.string(), symbols: z.array(z.string()),
  url: z.url(), isDemo: z.boolean()
});
export type NewsItemDto = z.infer<typeof newsItemDtoSchema>;
export const watchlistItemDtoSchema = z.object({
  symbol: z.string(), name: z.string(), price: z.string(),
  dayChangePercent: z.string(), trend: z.enum(['up', 'down', 'flat'])
});
export type WatchlistItemDto = z.infer<typeof watchlistItemDtoSchema>;

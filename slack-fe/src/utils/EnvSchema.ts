import z from "zod";

const envSchema = z.object({
  PREVIEW_API_KEY: z.string().trim().min(1),
  PORT: z.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().trim().min(1),
});

import z from "zod";
import DotEnv from "dotenv";
import path from "path";
DotEnv.config({
  path: path.join(process.cwd(), ".env.local"),
});

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
  GOOGLE_REDIRECT_URI: z.string().trim().min(1),
  MONGODB_URI: z.string().trim().min(1),
  SECRET: z.string().trim().min(1),
  SLACK_CLIENT_ID: z.string().trim().min(1),
  SLACK_CLIENT_SECRET: z.string().trim().min(1),
  SLACK_REDIRECT_URI: z.string().trim().min(1),
  FRONTEND_URL: z.string().trim().min(1),
});

const EnvParser = envSchema.safeParse({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  MONGODB_URI: process.env.MONGODB_URI,
  SECRET: process.env.SECRET,
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
  SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI,
  FRONTEND_URL: process.env.FRONTEND_URL,
});

export default EnvParser;

type EnvSchemaType = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchemaType {}
  }
}

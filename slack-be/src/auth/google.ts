import { Google } from "arctic";
import DotEnv from "dotenv";
DotEnv.config({
  path: ".env.local",
});
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

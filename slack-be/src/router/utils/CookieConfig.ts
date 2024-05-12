import { CookieOptions } from "express";

export const CookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 10 * 1000, // 10 minutes
  path: "/",
};

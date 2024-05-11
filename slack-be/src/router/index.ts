import { CookieOptions, Router } from "express";
import { google } from "../auth/google";
import {
  GoogleTokens,
  OAuth2RequestError,
  generateCodeVerifier,
  generateState,
} from "arctic";
import axios, { isCancel, AxiosError } from "axios";
import { UserModel } from "../model/UserModel";
import { generateIdFromEntropySize } from "lucia";
import { lucia } from "../auth/lucia";

export const router = Router();

const CookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 10 * 1000, // 10 minutes
  path: "/",
};

router.get("/login", async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });
  res.cookie("state", state, CookieConfig);
  res.cookie("codeVerifier", codeVerifier, CookieConfig);
  //   res.send("Cookie set");
  res.redirect(url.toString());
});

router.get("/auth/google/callback", async (req, res) => {
  const stateCookie = req.cookies.state;
  const codeVerifier = req.cookies.codeVerifier;

  const state = req.query.state as string;
  const code = req.query.code as string;

  if (
    !state ||
    !stateCookie ||
    !code ||
    stateCookie !== state ||
    !codeVerifier
  ) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens: GoogleTokens = await google.validateAuthorizationCode(
      code,
      codeVerifier
    );

    const response = await axios.get(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const UserData = response.data as {
      sub: string;
      name: string;
      given_name: string;
      famuly_name: string;
      picture: string;
      email: string;
      email_verified: boolean;
      locale: string;
    };

    const existingUser = await UserModel.findOne({
      UserSub: response.sub,
    });
    if (existingUser) {
    }
    const userId = generateIdFromEntropySize(10);
    const InsertedUser = await UserModel.create({
      _id: userId,
      email: UserData.email,
      DisplayName: UserData.name,
      picture: UserData.picture,
      UserSub: UserData.sub,
      family_name: UserData.famuly_name,
      given_name: UserData.given_name,
    });
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    res.send("Auth Suuccess");
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      // Oauth2 path error
      return res.sendStatus(400);
    }
    console.error(e);
    return res.sendStatus(500);
  }
});

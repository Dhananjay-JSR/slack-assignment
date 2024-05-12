import { Router } from "express";
import { lucia } from "../auth/lucia";
import { ValidateAuth } from "../utils/SessionValidator";
import {
  generateState,
  generateCodeVerifier,
  GoogleTokens,
  OAuth2RequestError,
} from "arctic";
import axios, { isCancel } from "axios";
import { generateIdFromEntropySize } from "lucia";
import { google } from "../auth/google";
import { UserModel } from "../model/UserModel";
import {
  SlackOKAccessTokenResponse,
  SlackErrorAccessTokenResponse,
} from "../types/SlackAccessType";
import { CookieConfig } from "../utils/CookieConfig";
import { GoogleUser } from "../types/GAuthType";
import { Sign } from "..";
export const AuthRouter = Router();

/**
 * @description Logout Route -> Invalidates Session and Clears Cookies
 */
AuthRouter.get("/logout", ValidateAuth, async (req, res) => {
  // Invalidate Session
  await lucia.invalidateSession(req.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return res.redirect(process.env.FRONTEND_URL! + "/callback");
});
/**
 * @description Initiates Slack OAuth2 Flow
 */
AuthRouter.get("/login/slack", ValidateAuth, async (req, res) => {
  //Initiate a new Slack OAuth2 flow
  let SlackURl = new URL("https://slack.com/oauth/v2/authorize");
  SlackURl.searchParams.append("scope", ""); // Bot Token Scopes
  SlackURl.searchParams.append(
    "user_scope",
    ["channels:read", "chat:write"].join(",") as string
  ); // User Token Scopes
  SlackURl.searchParams.append("redirect_uri", process.env.SLACK_REDIRECT_URI!);
  SlackURl.searchParams.append("client_id", process.env.SLACK_CLIENT_ID!);
  res.redirect(SlackURl.toString());
});

/**
 * @description Start a Google OAuth2 Flow
 */
AuthRouter.get("/login/google", async (req, res) => {
  // Generates State for OAuth2
  const state = generateState();
  //   Generates Code Verifier for PKCE
  const codeVerifier = generateCodeVerifier();
  //   Generates Authorization URL
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });
  //      Sets Cookies for State and Code Verifier to be used in Callback session
  res.cookie("state", state, CookieConfig);
  res.cookie("codeVerifier", codeVerifier, CookieConfig);
  //   Redirects to Google OAuth2
  res.redirect(url.toString());
});

AuthRouter.get("/auth/slack/callback", ValidateAuth, async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.sendStatus(400);
  }
  //   Get Access Token
  const AccessTokenURL = new URL("https://slack.com/api/oauth.v2.access");
  AccessTokenURL.searchParams.append("code", code as string);
  AccessTokenURL.searchParams.append("client_id", process.env.SLACK_CLIENT_ID);
  AccessTokenURL.searchParams.append(
    "client_secret",
    process.env.SLACK_CLIENT_SECRET
  );
  const AccessTokenReq = await axios.get(AccessTokenURL.toString());
  if (AccessTokenReq.status !== 200) {
    return res.status(500).json({
      error: "Unable to get Access Token from Slack",
    });
  }
  const AccessTokenData = AccessTokenReq.data as
    | SlackOKAccessTokenResponse
    | SlackErrorAccessTokenResponse;
  if (AccessTokenData.ok == false) {
    // if we get an error
    return res.status(400).json({
      error: AccessTokenData.error,
    });
  } else {
    // console.log("Access Token");
    // console.log(AccessTokenData.authed_user.access_token);
    const encryptedString = Sign.encrypt(
      AccessTokenData.authed_user.access_token
    );
    if (req.user.accessToken != null) {
      return res.status(400).json({
        error: "User already connected to Slack Account , Please Revoke First",
      });
    }
    const UpdateQuery = await UserModel.findOneAndUpdate(
      {
        _id: req.user.id,
      },
      {
        AccessToken: encryptedString,
      }
    );
    if (UpdateQuery) {
      // Redirect to Home
      //   return res.send("Slack Account Connected Successfully");
      return res.redirect(process.env.FRONTEND_URL + "/dashboard");
    } else {
      return res.status(500).json({
        error: "Unable to Connect Slack Account",
      });
    }
  }
});

/**
 * @description Callback for Google OAuth2
 */
AuthRouter.get("/auth/google/callback", async (req, res) => {
  //  Gets Cookies for State and Code Verifier
  const stateCookie = req.cookies.state;
  const codeVerifier = req.cookies.codeVerifier;
  // Gets Query Params for State and Code
  const state = req.query.state as string;
  const code = req.query.code as string;
  // Checks if State and Code are valid and matches with Cookies
  if (
    !state ||
    !stateCookie ||
    !code ||
    stateCookie !== state ||
    !codeVerifier
  ) {
    // In case of Invalid State or Code
    // reject with 400
    return res.sendStatus(400);
  }

  try {
    // Validate Authorization Code
    const tokens: GoogleTokens = await google.validateAuthorizationCode(
      code,
      codeVerifier
    );
    // Get User Data
    const response = await axios.get(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    const UserData = response.data as GoogleUser;

    // Check if User Exists
    const existingUser = await UserModel.findOne({
      UserSub: UserData.sub,
    });
    if (existingUser) {
      // if User Exists, Create Session and Set Cookie
      const session = await lucia.createSession(existingUser._id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      res.cookie(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      //   Redirect to Home
      return res.redirect(
        process.env.FRONTEND_URL + "/callback?session=success"
      );
    }
    // if User does not exist, Create User and Session
    const userId = generateIdFromEntropySize(10);
    const InsertedUser = await UserModel.create({
      _id: userId,
      email: UserData.email,
      DisplayName: UserData.name,
      picture: UserData.picture,
      UserSub: UserData.sub,
      family_name: UserData.family_name,
      given_name: UserData.given_name,
    });
    if (!InsertedUser) {
      // In case of DB Error
      return res.sendStatus(500);
    }
    // Create Session and Set Cookie
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.cookie(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    // Redirect to Home
    return res.redirect(process.env.FRONTEND_URL + "/callback?session=success");
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      // Oauth2 path error or invalid code
      return res.sendStatus(400);
    }
    if (isCancel(e)) {
      // Request Cancelled
      return res.sendStatus(400);
    }
    // Other Errors
    console.error(e);
    return res.sendStatus(500);
  }
});

/**
 * @description Profile Route -> Returns User Profile for authenticated Request
 */
AuthRouter.get("/profile", ValidateAuth, async (req, res) => {
  return res.json({
    user: {
      displayName: req.user.displayName,
      picture: req.user.picture,
      isSlackConnected: req.user.accessToken ? true : false,
    },
  });
});

import {
  CookieOptions,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
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
import { ValidateAuth } from "./utils/SessionValidator";
import { CookieConfig } from "./utils/CookieConfig";
import DotEnv from "dotenv";
import Cryptr from "cryptr";
import {
  SlackErrorAccessTokenResponse,
  SlackOKAccessTokenResponse,
} from "./types/SlackAccessType";
import AccessTokenValidator from "./utils/AccessTokenValidator";

const cryptr = new Cryptr(process.env.SECRET!);
export const router = Router();

router.delete("/revoke", ValidateAuth, async (req, res) => {
  if (!req.user.accessToken) {
    return res.status(400).json({
      error: "User not connected to Slack Account",
    });
  }
  try {
    const RevokeRequest = await axios.get("https://slack.com/api/auth.revoke", {
      params: {
        token: cryptr.decrypt(req.user.accessToken),
      },
    });
    if (RevokeRequest.status == 200) {
      const UpdateQuery = await UserModel.findOneAndUpdate(
        {
          _id: req.user.id,
        },
        {
          AccessToken: null,
        }
      );
      if (UpdateQuery) {
        return res.json({
          message: "Slack Account Disconnected Successfully",
        });
      } else {
        return res.status(500).json({
          error: "Unable to Disconnect Slack Account",
        });
      }
    } else {
      return res.status(500).json({
        error: "Unable to Disconnect Slack Account",
      });
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      return res.status(500).json({
        error: "Unable to Disconnect Slack Account",
      });
    }
  }
});

router.get("/logout", ValidateAuth, async (req, res) => {
  await lucia.invalidateSession(req.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return res.redirect(process.env.FRONTEND_URL! + "/callback");
});
router.get("/profile", ValidateAuth, async (req: Request, res: Response) => {
  return res.json({
    user: {
      displayName: req.user.displayName,
      picture: req.user.picture,
      isSlackConnected: req.user.accessToken ? true : false,
    },
  });
});
router.post("/send/:channelID", ValidateAuth, async (req, res) => {
  const channelID = req.params.channelID;
  if (!channelID) {
    return res.status(400).json({
      error: "Channel ID is required",
    });
  }
  if (!req.user.accessToken) {
    return res.status(400).json({
      error: "User not connected to Slack Account",
    });
  }
  try {
    const SendRequest = await axios.post(
      "https://slack.com/api/chat.postMessage",
      null,
      {
        params: {
          channel: channelID,
          blocks: JSON.stringify([
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Hello \n My Full Name is *${req.user.displayName}* \n My Email is *mailto:${req.user.email}* \n Msg Sent From Slack API`,
              },
              accessory: {
                type: "image",
                image_url: req.user.picture,
                alt_text: `${req.user.displayName} Image`,
              },
            },
          ]),
        },
        headers: {
          Authorization: `Bearer ${cryptr.decrypt(req.user.accessToken)}`,
        },
      }
    );
    if (SendRequest.status === 200) {
      return res.status(201).json({
        message: "Message Sent Successfully",
      });
    } else {
      return res.status(500).json({
        error: "Unable to send message to Slack",
      });
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.status == 429) {
        const retryAfter = e.response?.headers["Retry-After"];
        return res.status(429).json({
          error: "Rate Limit Exceeded",
          retryAfter: retryAfter,
        });
      }
      return res.status(500).json({
        error: "Unable to send message to Slack",
      });
    }
  }
});

//get list of authenticated channels from slack
router.get("/channels", ValidateAuth, async (req, res) => {
  if (!req.user.accessToken) {
    return res.status(400).json({
      error: "User not connected to Slack Account",
    });
  }
  try {
    const ChannelRequest = await axios.get(
      "https://slack.com/api/conversations.list",
      {
        headers: {
          Authorization: `Bearer ${cryptr.decrypt(req.user.accessToken)}`,
        },
      }
    );

    if (ChannelRequest.status !== 200) {
      return res.status(500).json({
        error: "Unable to get Channels from Slack",
      });
    }

    const ChannelData = ChannelRequest.data as
      | {
          ok: true;
          channels: { id: string; name: string }[];
        }
      | {
          ok: false;
          error: string;
        };

    if (ChannelData.ok == false) {
      return res.status(400).json({
        error: ChannelData.error,
      });
    }
    return res.json(
      ChannelData.channels.map((channels) => ({
        id: channels.id,
        name: channels.name,
      }))
    );
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.status == 429) {
        const retryAfter = e.response?.headers["Retry-After"];
        return res.status(429).json({
          error: "Rate Limit Exceeded",
          retryAfter: retryAfter,
        });
      }
      return res.status(500).json({
        error: "Unable to get Channels from Slack",
      });
    }
  }
});

router.get("/login/slack", ValidateAuth, async (req, res) => {
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
 * @description Redirects to Google Login
 */
router.get("/login/google", async (req, res) => {
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

router.get("/auth/slack/callback", ValidateAuth, async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.sendStatus(400);
  }
  //   Get Access Token
  const AccessTokenURL = new URL("https://slack.com/api/oauth.v2.access");
  AccessTokenURL.searchParams.append("code", code as string);
  AccessTokenURL.searchParams.append("client_id", process.env.SLACK_CLIENT_ID!);
  AccessTokenURL.searchParams.append(
    "client_secret",
    process.env.SLACK_CLIENT_SECRET!
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
    const encryptedString = cryptr.encrypt(
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
router.get("/auth/google/callback", async (req, res) => {
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
      //   return res.send("Auth Suuccess");
      return res.redirect(
        process.env.FRONTEND_URL + "/callback?session=" + session.id
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
    // return res.send("Auth Suuccess");
    return res.redirect(
      process.env.FRONTEND_URL + "/callback?session=" + session.id
    );
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

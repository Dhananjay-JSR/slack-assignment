import axios, { AxiosError } from "axios";
import cryptr from "cryptr";
import { Router } from "express";
import { UserModel } from "../model/UserModel";
import { ValidateAuth } from "../utils/SessionValidator";
import { Sign } from "..";

export const SlackRoutes = Router();

/**
 * @description Revoke Slack Access Token -> Unbinds Slack from Connected Account
 */
SlackRoutes.delete("/revoke", ValidateAuth, async (req, res) => {
  // Check if User is connected to Slack
  if (!req.user.accessToken) {
    return res.status(400).json({
      error: "User not connected to Slack Account",
    });
  }
  try {
    const RevokeRequest = await axios.get("https://slack.com/api/auth.revoke", {
      params: {
        token: Sign.decrypt(req.user.accessToken),
      },
    });
    if (RevokeRequest.status == 200) {
      // Update User Model to remove AccessToken
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

/**
 * @description Send Message to Specific Channel
 */
SlackRoutes.post("/send/:channelID", ValidateAuth, async (req, res) => {
  // Get Channel ID from Request Params
  // if not present return 400
  const channelID = req.params.channelID;
  if (!channelID) {
    return res.status(400).json({
      error: "Channel ID is required",
    });
  }
  // Check if User is connected to Slack
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
          Authorization: `Bearer ${Sign.decrypt(req.user.accessToken)}`,
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
/**
 * @description Get Channel List of User
 */
SlackRoutes.get("/channels", ValidateAuth, async (req, res) => {
  // Check if User is connected to Slack
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
          Authorization: `Bearer ${Sign.decrypt(req.user.accessToken)}`,
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
      // reply with Slack Error
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

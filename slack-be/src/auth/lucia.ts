import { Lucia } from "lucia";
import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import mongoose from "mongoose";
const adapter = new MongodbAdapter(
  mongoose.connection.collection("sessions"),
  mongoose.connection.collection("users")
);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes that will be available in User object
      userSub: attributes.UserSub,
      email: attributes.email,
      displayName: attributes.DisplayName,
      picture: attributes.picture,
      familyName: attributes.family_name,
      accessToken: attributes.AccessToken,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: number;
  DisplayName: string;
  picture: string;
  UserSub: string;
  family_name: string;
  given_name: string;
  AccessToken: string;
}

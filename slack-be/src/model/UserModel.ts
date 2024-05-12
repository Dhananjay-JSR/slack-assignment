import mongoose from "mongoose";
const { Schema } = mongoose;
const UserSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    AccessToken: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    DisplayName: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    UserSub: {
      type: String,
      required: true,
    },
    family_name: {
      type: String,
      default: null,
    },
    given_name: {
      type: String,
      default: null,
    },
  } as const,
  {
    _id: false,
  }
);

export const UserModel = mongoose.model("User", UserSchema);

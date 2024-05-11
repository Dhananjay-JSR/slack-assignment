import mongoose from "mongoose";
const { Schema } = mongoose;
const UserSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
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
    },
    given_name: {
      type: String,
    },
  } as const,
  {
    _id: false,
  }
);

export const UserModel = mongoose.model("User", UserSchema);

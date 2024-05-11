import mongoose from "mongoose";
const { Schema } = mongoose;
const UserSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
  } as const,
  {
    _id: false,
  }
);

export const UserModel = mongoose.model("User", UserSchema);

import EnvParser from "./utils/EnvValidator";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import CookieParser from "cookie-parser";
import Cryptr from "cryptr";
import { AuthRouter } from "./router/AuthRouter";
import { SlackRoutes } from "./router/SlackRouter";

if (!EnvParser.success) {
  // Throw error and exit if there is an issue with the environment variables
  console.error(EnvParser.error.issues);
  console.error("There is an error with the server environment variables");
  process.exit(1);
}
export const Sign = new Cryptr(process.env.SECRET);
const PORT = process.env.PORT || 3000;

const App = express();

App.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
App.use(CookieParser());

App.use("/", AuthRouter);
App.use("/", SlackRoutes);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");
    App.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

import DotEnv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { router } from "./router";
import cors from "cors";
import CookieParser from "cookie-parser";

DotEnv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 3000;

const App = express();
App.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
App.use(CookieParser());

App.use("/", router);

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

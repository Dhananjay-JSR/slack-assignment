import DotEnv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { router } from "./router";
import CookieParser from "cookie-parser";

DotEnv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 3000;

const App = express();
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

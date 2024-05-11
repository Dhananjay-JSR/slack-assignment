import DotEnv from "dotenv";
import express from "express";
import mongoose from "mongoose";

DotEnv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 4000;

const App = express();

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

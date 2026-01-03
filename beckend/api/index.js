import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

dotenv.config();

// Connect DB once per cold start
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

export default handler;

import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import app from "../src/app.js";

dotenv.config();

let isConnected = false;

export default async function handler(req, res) {
  // CORS headers
  const allowedOrigins = [
    "https://newtube-ten-omega.vercel.app",
    "http://localhost:5173"
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Cookie, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return app(req, res);
}
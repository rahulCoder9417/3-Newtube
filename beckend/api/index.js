import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

dotenv.config();

// Connect DB once per cold start for vercel

let isConnected = false;

const handler = async (req, res) => {
        // Set CORS headers FIRST, before anything else
        const allowedOrigins = [
          "https://newtube-ten-omega.vercel.app",
          
     
        ];
        
        const origin = req.headers.origin;
        console.log(origin);
        if (allowedOrigins.includes(origin)) {
          console.log("Origin is allowed");
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
        
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }
        

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  
  // Use Express app as a request handler
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default handler;
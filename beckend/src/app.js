import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://newtube-9b0uq4t87-rahulcoder9417s-projects.vercel.app",
        "https://newtube-five.vercel.app"
      ];
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };

app.use(cors(corsOptions))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.get("/api/v1/health", (req, res) =>   res.status(200).json({ status: "ok", timestamp: new Date() }))


//routes import
import userRouter from './routes/user.routes.js'
import photoRouter from './routes/photo.routes.js'

import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import chatRouter from "./routes/chat.routes.js"

//routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/chats", chatRouter)
app.use("/api/v1/photos", photoRouter)

// http://localhost:8000/api/v1/users/register
export default app
export { app }
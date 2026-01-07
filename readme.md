# NewTube - Full Stack Social Media Platform

A comprehensive social media platform combining the best features of YouTube, TikTok, Twitter, and Instagram. Built with the MERN stack, NewTube offers a complete multimedia sharing experience with videos, shorts, tweets, and photo discovery.

## 🌟 Features

### 📹 Video Platform
- Upload and share long-form videos
- Like, dislike, and comment on videos
- Video player with controls
- Watch history tracking
- Create and manage playlists
- Subscribe to channels

### 🎬 Shots (Vertical Short Videos)
- Upload and view short vertical videos
- Swipe-through interface
- Like, dislike, and comment functionality
- Optimized for mobile viewing

### 🐦 Twitter-Style Posts
- Create text-based tweets
- Like and dislike tweets
- Retweet functionality
- Timeline feed

### 🖼️ Discover (Photo Sharing)
- Post and browse photos
- Like, dislike, and comment on images
- Grid-based discovery interface
- Explore trending content

### 💬 Advanced Comment System
- Nested replies support
- Like and dislike comments
- Edit and delete your comments
- Real-time comment updates
- Threaded conversations

### 👤 User Features
- User authentication with JWT
- Cookie-based session management
- User profiles
- Watch history
- Custom playlists
- Subscription management

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Cookie-Parser** - Cookie management
- **Multer** - File upload handling
- **Cloudinary** - Media storage (likely)

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API / Redux** - State management
- **CSS3 / Styled Components** - Styling

## 📁 Project Structure

```
newtube/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rahulCoder9417/3-Newtube.git
cd 3-Newtube
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Variables**

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Cloudinary Configuration (if used)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Run the Application**

Start the backend server:
```bash
cd backend
npm start
# or for development
npm run dev
```

Start the frontend application:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
```

### Videos
```
GET    /api/videos              - Get all videos
GET    /api/videos/:id          - Get single video
POST   /api/videos              - Upload video
PUT    /api/videos/:id          - Update video
DELETE /api/videos/:id          - Delete video
POST   /api/videos/:id/like     - Like video
POST   /api/videos/:id/dislike  - Dislike video
```

### Shots
```
GET    /api/shots               - Get all shots
GET    /api/shots/:id           - Get single shot
POST   /api/shots               - Upload shot
DELETE /api/shots/:id           - Delete shot
POST   /api/shots/:id/like      - Like shot
POST   /api/shots/:id/dislike   - Dislike shot
```

### Tweets
```
GET    /api/tweets              - Get all tweets
POST   /api/tweets              - Create tweet
DELETE /api/tweets/:id          - Delete tweet
POST   /api/tweets/:id/like     - Like tweet
POST   /api/tweets/:id/dislike  - Dislike tweet
POST   /api/tweets/:id/retweet  - Retweet
```

### Discover (Photos)
```
GET    /api/discover            - Get all photos
POST   /api/discover            - Upload photo
DELETE /api/discover/:id        - Delete photo
POST   /api/discover/:id/like   - Like photo
POST   /api/discover/:id/dislike - Dislike photo
```

### Comments
```
GET    /api/comments/:contentId - Get comments for content
POST   /api/comments            - Create comment
PUT    /api/comments/:id        - Edit comment
DELETE /api/comments/:id        - Delete comment
POST   /api/comments/:id/like   - Like comment
POST   /api/comments/:id/dislike - Dislike comment
POST   /api/comments/:id/reply  - Reply to comment
```

### Playlists
```
GET    /api/playlists           - Get user playlists
POST   /api/playlists           - Create playlist
PUT    /api/playlists/:id       - Update playlist
DELETE /api/playlists/:id       - Delete playlist
POST   /api/playlists/:id/add   - Add video to playlist
```

### Watch History
```
GET    /api/history             - Get watch history
POST   /api/history/:videoId    - Add to watch history
DELETE /api/history/:videoId    - Remove from history
```

## 🔒 Authentication Flow

1. User registers or logs in
2. Server generates JWT token
3. Token is stored in HTTP-only cookie
4. Client sends cookie with each request
5. Server validates token via middleware
6. Protected routes accessible with valid token

## 🎨 Key Features Implementation

### Nested Comments
- Hierarchical comment structure
- Parent-child relationships
- Recursive rendering on frontend
- Edit and delete functionality with ownership validation

### Watch History
- Automatic tracking of viewed videos
- Timestamp-based ordering
- Easy access to previously watched content

### Playlists
- Create custom collections
- Add/remove videos
- Public/private visibility options

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions for shots

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Rahul**
- GitHub: [@rahulCoder9417](https://github.com/rahulCoder9417)

## 🙏 Acknowledgments

- Inspired by YouTube, TikTok, Twitter, and Instagram
- Built with the MERN stack
- Community feedback and contributions

## 📞 Support

For support, email or open an issue in the GitHub repository.

---

⭐ Star this repository if you find it helpful!
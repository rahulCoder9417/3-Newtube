import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";
import { Photo } from "../src/models/photo.model.js";
import { Tweet } from "../src/models/tweet.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Like } from "../src/models/like.model.js";
import { Subscription } from "../src/models/subscription.model.js";
import { Playlist } from "../src/models/playlist.model.js";

const MONGODB_URI = process.env.MONGODB_URI;
const HASHED_PASSWORD = "";

const tags = ["Music", "Education", "Comedy", "Tech", "Sports"];

// Sample Users Data
const usersData = [
  {
    username: "sarah_tech",
    email: "sarah.tech@example.com",
    fullName: "Sarah Mitchell",
    avatar: "https://i.pravatar.cc/300?img=5",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926",
    password: HASHED_PASSWORD,
  },
  {
    username: "alex_creative",
    email: "alex.creative@example.com",
    fullName: "Alex Rodriguez",
    avatar: "https://i.pravatar.cc/300?img=12",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    password: HASHED_PASSWORD,
  },
  {
    username: "emily_educator",
    email: "emily.edu@example.com",
    fullName: "Emily Chen",
    avatar: "https://i.pravatar.cc/300?img=9",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
    password: HASHED_PASSWORD,
  },
  {
    username: "mike_sports",
    email: "mike.sports@example.com",
    fullName: "Michael Johnson",
    avatar: "https://i.pravatar.cc/300?img=15",
    coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    password: HASHED_PASSWORD,
  },
  {
    username: "lisa_music",
    email: "lisa.music@example.com",
    fullName: "Lisa Anderson",
    avatar: "https://i.pravatar.cc/300?img=20",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    password: HASHED_PASSWORD,
  },
  {
    username: "david_comedy",
    email: "david.comedy@example.com",
    fullName: "David Martinez",
    avatar: "https://i.pravatar.cc/300?img=33",
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
    password: HASHED_PASSWORD,
  },
];

// Sample Videos Data
const videosData = [
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479",
    title: "Introduction to Machine Learning Fundamentals",
    description: "Comprehensive guide to understanding the basics of machine learning, neural networks, and their real-world applications.",
    duration: 1245,
    videoType: "long",
    tags: ["Tech", "Education"],
    views: 15420,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    title: "Piano Tutorial: Beginner's Guide to Jazz",
    description: "Learn the fundamentals of jazz piano with easy-to-follow lessons and practice exercises.",
    duration: 1820,
    videoType: "long",
    tags: ["Music", "Education"],
    views: 8750,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    title: "Epic Basketball Trick Shots",
    description: "Watch these incredible basketball trick shots and learn the techniques behind them!",
    duration: 45,
    videoType: "short",
    tags: ["Sports"],
    views: 32100,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
    title: "Stand-Up Comedy: Life in the Digital Age",
    description: "Hilarious take on modern technology and social media culture.",
    duration: 35,
    videoType: "short",
    tags: ["Comedy"],
    views: 45200,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    title: "Web Development in 2024: Complete Roadmap",
    description: "Everything you need to know to become a full-stack developer in 2024, including frameworks, tools, and best practices.",
    duration: 2150,
    videoType: "long",
    tags: ["Tech", "Education"],
    views: 21300,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    title: "Top 10 Music Production Tips",
    description: "Professional music production techniques used by top producers in the industry.",
    duration: 890,
    videoType: "long",
    tags: ["Music", "Education"],
    views: 12400,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    title: "Morning Workout Routine",
    description: "Quick and effective 30-second workout to energize your morning!",
    duration: 30,
    videoType: "short",
    tags: ["Sports"],
    views: 18900,
    isPublished: true,
  },
  {
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    title: "Comedy Sketch: Office Life",
    description: "Relatable comedy about everyday office situations we all experience.",
    duration: 42,
    videoType: "short",
    tags: ["Comedy"],
    views: 28700,
    isPublished: true,
  },
];

// Sample Photos Data
const photosData = [
  {
    url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
    title: "Sunset Over Mountains",
    description: "Breathtaking view of the sunset painting the mountain peaks in golden hues.",
    morePhoto: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d"
    ],
    views: 2340,
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    title: "Modern Tech Setup",
    description: "Minimal and productive workspace design featuring the latest technology.",
    morePhoto: [
      "https://images.unsplash.com/photo-1547658719-da2b51169166",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
    ],
    views: 4120,
  },
  {
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    title: "Vintage Piano",
    description: "Classic grand piano in a beautifully lit music studio.",
    morePhoto: [
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0",
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76"
    ],
    views: 1890,
  },
  {
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    title: "Basketball Court Aerial View",
    description: "Stunning aerial perspective of an outdoor basketball court at sunset.",
    morePhoto: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc",
      "https://images.unsplash.com/photo-1519766304817-4f37bda74a26"
    ],
    views: 3250,
  },
  {
    url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
    title: "Comedy Show Stage",
    description: "Professional comedy club stage setup with perfect lighting and atmosphere.",
    morePhoto: [
      "https://images.unsplash.com/photo-1478147427282-58a87a120781",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae"
    ],
    views: 1567,
  },
];

// Sample Tweets Data
const tweetsData = [
  {
    content: "Just deployed my first full-stack application using MERN stack! The journey from idea to production was incredible. #WebDev #MERN",
    type: "parent",
    photo: null,
  },
  {
    content: "Practice makes perfect! Spent 4 hours today working on jazz improvisation. The progress is slow but so rewarding. 🎹",
    type: "parent",
    photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
  },
  {
    content: "New video out now! Breaking down machine learning concepts in the simplest way possible. Check it out!",
    type: "parent",
    photo: null,
  },
  {
    content: "Basketball isn't just a sport, it's a way of life. Every shot teaches you something about patience and precision. 🏀",
    type: "parent",
    photo: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
  },
  {
    content: "The best comedy comes from observing everyday life. Everything is material if you look at it the right way! 😄",
    type: "parent",
    photo: null,
  },
  {
    content: "Absolutely! The debugging process teaches you more than any tutorial ever could.",
    type: "retweet",
    photo: null,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    await Photo.deleteMany({});
    await Tweet.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Subscription.deleteMany({});
    await Playlist.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create Users
    const users = await User.insertMany(usersData);
    console.log(`✅ Created ${users.length} users`);

    // Create Videos with owners
    const videos = await Video.insertMany(
      videosData.map((video, index) => ({
        ...video,
        owner: users[index % users.length]._id,
      }))
    );
    console.log(`✅ Created ${videos.length} videos`);

    // Create Photos with owners
    const photos = await Photo.insertMany(
      photosData.map((photo, index) => ({
        ...photo,
        owner: users[index % users.length]._id,
      }))
    );
    console.log(`✅ Created ${photos.length} photos`);

    // Create Tweets with owners
    const tweets = [];
    for (let i = 0; i < tweetsData.length; i++) {
      const tweet = await Tweet.create({
        ...tweetsData[i],
        owner: users[i % users.length]._id,
      });
      tweets.push(tweet);
    }

    // Make last tweet a retweet of first tweet
    tweets[5].children = [];
    await tweets[0].updateOne({ $push: { children: tweets[5]._id } });
    console.log(`✅ Created ${tweets.length} tweets`);

    // Create Comments on videos and photos
    const comments = [];
    
    // Video comments
    for (let i = 0; i < videos.length; i++) {
      const comment1 = await Comment.create({
        content: "Great content! This really helped me understand the topic better.",
        video: videos[i]._id,
        owner: users[(i + 1) % users.length]._id,
        type: "comment",
      });
      
      const comment2 = await Comment.create({
        content: "Could you make a follow-up video on this topic?",
        video: videos[i]._id,
        owner: users[(i + 2) % users.length]._id,
        type: "comment",
      });

      // Reply to first comment
      const reply = await Comment.create({
        content: "I agree! This explanation was super clear.",
        video: videos[i]._id,
        owner: users[(i + 3) % users.length]._id,
        type: "comment",
        parentId: comment1._id,
      });

      await comment1.updateOne({ $push: { replies: reply._id } });
      comments.push(comment1, comment2, reply);
    }

    // Photo comments
    for (let i = 0; i < photos.length; i++) {
      const photoComment = await Comment.create({
        content: "Stunning shot! What camera did you use?",
        photo: photos[i]._id,
        owner: users[(i + 1) % users.length]._id,
        type: "comment",
      });
      comments.push(photoComment);
    }
    console.log(`✅ Created ${comments.length} comments`);

    // Create Likes
    const likes = [];
    
    // Like videos
    for (let i = 0; i < videos.length; i++) {
      for (let j = 0; j < 3; j++) {
        likes.push({
          video: videos[i]._id,
          action: "like",
          likedBy: users[(i + j) % users.length]._id,
        });
      }
    }

    // Like photos
    for (let i = 0; i < photos.length; i++) {
      for (let j = 0; j < 2; j++) {
        likes.push({
          photo: photos[i]._id,
          action: "like",
          likedBy: users[(i + j) % users.length]._id,
        });
      }
    }

    // Like tweets
    for (let i = 0; i < tweets.length; i++) {
      likes.push({
        tweet: tweets[i]._id,
        action: "like",
        likedBy: users[(i + 1) % users.length]._id,
      });
    }

    // Like comments
    for (let i = 0; i < Math.min(10, comments.length); i++) {
      likes.push({
        comment: comments[i]._id,
        action: "like",
        likedBy: users[(i + 1) % users.length]._id,
      });
    }

    await Like.insertMany(likes);
    console.log(`✅ Created ${likes.length} likes`);

    // Create Subscriptions
    const subscriptions = [];
    for (let i = 0; i < users.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const channelIndex = (i + j) % users.length;
        if (i !== channelIndex) {
          subscriptions.push({
            subscriber: users[i]._id,
            channel: users[channelIndex]._id,
          });
        }
      }
    }
    await Subscription.insertMany(subscriptions);
    console.log(`✅ Created ${subscriptions.length} subscriptions`);

    // Create Playlists
    const playlists = [
      {
        name: "Tech Tutorials Collection",
        description: "Comprehensive collection of technology and programming tutorials",
        videos: videos.filter(v => v.tags.includes("Tech")).map(v => v._id),
        owner: users[0]._id,
      },
      {
        name: "Music Masterclass",
        description: "Learn music theory and instrument techniques",
        videos: videos.filter(v => v.tags.includes("Music")).map(v => v._id),
        owner: users[4]._id,
      },
      {
        name: "Sports Highlights",
        description: "Best sports moments and training videos",
        videos: videos.filter(v => v.tags.includes("Sports")).map(v => v._id),
        owner: users[3]._id,
      },
    ];
    await Playlist.insertMany(playlists);
    console.log(`✅ Created ${playlists.length} playlists`);

    // Update users with close friends
    await users[0].updateOne({ $push: { closeFriends: [users[1]._id, users[2]._id] } });
    await users[1].updateOne({ $push: { closeFriends: [users[0]._id, users[3]._id] } });
    await users[2].updateOne({ $push: { closeFriends: [users[0]._id, users[4]._id] } });
    console.log("✅ Updated close friends relationships");

    // Add watch history
    await users[0].updateOne({ $push: { watchHistory: [videos[0]._id, videos[4]._id] } });
    await users[1].updateOne({ $push: { watchHistory: [videos[1]._id, videos[5]._id] } });
    console.log("✅ Updated watch history");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Videos: ${videos.length}`);
    console.log(`   Photos: ${photos.length}`);
    console.log(`   Tweets: ${tweets.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Likes: ${likes.length}`);
    console.log(`   Subscriptions: ${subscriptions.length}`);
    console.log(`   Playlists: ${playlists.length}`);
    console.log("\n✨ Your social media platform is ready to showcase!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
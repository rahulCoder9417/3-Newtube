import React, { useEffect, useState } from "react";
import { FaVideo, FaRegFileAlt, FaRegPlayCircle, FaAcquisitionsIncorporated } from "react-icons/fa";
import { AiFillEdit } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { onSubmitAxios } from "../utils/axios";
import VideoComponent from "../components/uni/VideoComponent";
import PlayListIcons from "../components/playlist/PlayListIcons";
import Photo from "../components/photo/Photo";

const User = () => {
  const [dummyData, setDummyData] = useState({});
  const [data, setData] = useState({ playlist: [], videos: [], shot: [], photo: [] });
  const [activeTab, setActiveTab] = useState("posts");
  const userId = useSelector((state)=>state.auth.id)
  console.log(userId)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const user = await onSubmitAxios("get", `users/getUser/${userId}`);
        setDummyData(user.data.data);

        // Fetch videos
        const videos = await onSubmitAxios("get", "videos/", {}, {}, { userId, type: "long" });
        setData((prev) => ({ ...prev, videos: videos.data.data }));

        // Fetch photos
        const photos = await onSubmitAxios("get", "photos/", {}, {}, { userId });
        setData((prev) => ({ ...prev, photo: photos.data.data.docs }));

        // Fetch shorts
        const shorts = await onSubmitAxios("get", "videos/", {}, {}, { userId, type: "short" });
        setData((prev) => ({ ...prev, shot: shorts.data.data }));

        // Fetch playlists
        const playlistResponse = await onSubmitAxios("get", `playlist/user/${userId}`);
        const watchHistory = await onSubmitAxios("get", "users/current-user");
        const watchHistoryPlaylist = {
          _id: "watch-history",
          videos: watchHistory.data.data.watchHistory,
        };
        console.log(watchHistoryPlaylist)
        setData((prev) => ({
          ...prev,
          playlist: [...playlistResponse.data.data, watchHistoryPlaylist],
        }));
      } catch (error) {
        console.error("Error in fetching user data:", error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="w-[100vw] min-h-screen bg-gray-800">
    <div className="max-w-[90%] mx-auto bg-gray-950 shadow-md  rounded-lg overflow-hidden">
      {/* Cover Image */}
      <div className="relative">
        <div
          className="h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${dummyData.coverImage || "default-cover.jpg"})` }}
        ></div>
        <img
          className="absolute bottom-0 left-4 transform translate-y-1/2 w-20 h-20 rounded-full border-4 border-white shadow-md"
          src={dummyData.avatar || "default-avatar.jpg"}
          alt={`${dummyData.username || "User"}'s avatar`}
        />
      </div>

      {/* User Info */}
      <div className="text-center mt-10">
        <h2 className="text-xl text-white font-semibold">{dummyData.fullName || "User Full Name"}</h2>
        <p className="text-gray-500">@{dummyData.username || "username"}</p>
      </div>

      {/* Edit and Upload Buttons */}
      <div className="flex justify-center mt-4 space-x-4">
        <Link
          to="/user-updation"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
        >
          <AiFillEdit className="inline mr-2 text-lg" />
          Edit
        </Link>
        <Link
          to="/uploading"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
        >
          Upload
        </Link>
        <Link
          to="/update"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
        >
          Update
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex justify-around mt-6 border-t border-gray-200">
        {["posts", "shorts", "videos", "playlist"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "posts" && <FaRegFileAlt className="inline mr-1" />}
            {tab === "shorts" && <FaRegPlayCircle className="inline mr-1" />}
            {tab === "videos" && <FaVideo className="inline mr-1" />}
            {tab === "playlist" && <FaAcquisitionsIncorporated className="inline mr-1" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-3 gap-3">
        {activeTab === "posts" &&
          data.photo.map((photo) => (
            <Photo
              key={photo._id}
              photo={photo.url}
              morePhoto={photo.morePhoto}
              fullName={photo.ownerDetails?.fullName}
              avatar={photo.ownerDetails?.avatar}
              title={photo.title}
              description={photo.description}
              id={photo.ownerDetails?._id}
            />
          ))}

        {activeTab === "shorts" &&
          data.shot.map((shot) => (
            <VideoComponent
              key={shot._id}
              title={shot.title}
              description={shot.description}
              thumbnail={shot.thumbnail}
              id={shot._id}
            />
          ))}

        {activeTab === "videos" &&
          data.videos.map((video) => (
            <VideoComponent
              key={video._id}
              title={video.title}
              description={video.description}
              thumbnail={video.thumbnail}
              id={video._id}
            />
          ))}

        {activeTab === "playlist" &&
          data.playlist.map((playlist) => (
            <PlayListIcons
              key={playlist._id}
              id={playlist._id}
              videosLength={playlist.videos.length}
              videoFirst={playlist.videos[0]}
            />
          ))}
      </div>
    </div></div>
  );
};

export default User;

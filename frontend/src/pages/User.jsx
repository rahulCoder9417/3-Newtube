import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaVideo,
  FaRegFileAlt,
  FaRegPlayCircle,
  FaListAlt,
  FaEdit,
  FaUpload,
  FaSync,
} from "react-icons/fa";
import { onSubmitAxios } from "../utils/axios";
import VideoComponent from "../components/uni/VideoComponent";
import PlayListIcons from "../components/playlist/PlayListIcons";
import Photo from "../components/photo/DashboardPhoto";
import ShotComponent from "../components/uni/ShotComponent";
import VideoP from "../components/uni/Video";

const TABS = {
  POSTS: "posts",
  SHORTS: "shorts",
  VIDEOS: "videos",
  PLAYLIST: "playlist",
};

const User = () => {
  const userId = useSelector((state) => state.auth.id);

  const [userProfile, setUserProfile] = useState(null);
  const [content, setContent] = useState({
    playlist: [],
    videos: [],
    shots: [],
    photos: [],
  });
  const [activeTab, setActiveTab] = useState(TABS.POSTS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [userResponse, videosResponse, photosResponse, shotsResponse, playlistResponse, watchHistoryResponse] =
          await Promise.all([
            onSubmitAxios("get", `users/getUser/${userId}`),
            onSubmitAxios("get", "videos/", {}, {}, { userId, type: "long" }),
            onSubmitAxios("get", "photos/", {}, {}, { userId }),
            onSubmitAxios("get", "videos/", {}, {}, { userId, type: "short" }),
            onSubmitAxios("get", `playlist/user/${userId}`),
            onSubmitAxios("get", "users/current-user"),
          ]);

        // Set user profile
        setUserProfile(userResponse.data.data);

        // Create watch history playlist object
        const watchHistoryPlaylist = {
          _id: "watch-history",
          videos: watchHistoryResponse.data.data.watchHistory || [],
        };

        // Set all content
        setContent({
          videos: videosResponse.data.data || [],
          photos: photosResponse.data.data.docs || [],
          shots: shotsResponse.data.data || [],
          playlist: [...playlistResponse.data.data, watchHistoryPlaylist],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const tabs = [
    { key: TABS.POSTS, label: "Posts", icon: FaRegFileAlt },
    { key: TABS.SHORTS, label: "Shorts", icon: FaRegPlayCircle },
    { key: TABS.VIDEOS, label: "Videos", icon: FaVideo },
    { key: TABS.PLAYLIST, label: "Playlists", icon: FaListAlt },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-700/50">
          {/* Cover Image Section */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-900 to-purple-900">
            {userProfile.coverImage && (
              <img
                src={userProfile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Avatar */}
            <div className="absolute -bottom-16 left-8">
              <img
                src={userProfile.avatar || "/default-avatar.jpg"}
                alt={userProfile.username}
                className="w-32 h-32 rounded-full border-4 border-gray-900 shadow-xl object-cover"
              />
            </div>
          </div>

          {/* User Info Section */}
          <div className="pt-20 pb-6 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {userProfile.fullName}
                </h2>
                <p className="text-gray-400 text-lg">@{userProfile.username}</p>
                {userProfile.email && (
                  <p className="text-gray-500 text-sm mt-1">{userProfile.email}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/user-updation"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                >
                  <FaEdit />
                  Edit Profile
                </Link>
                <Link
                  to="/uploading"
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all hover:scale-105"
                >
                  <FaUpload />
                  Upload
                </Link>
                <Link
                  to="/update"
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition-all hover:scale-105"
                >
                  <FaSync />
                  Update
                </Link>
              </div>
            </div>

            {/* Stats (Optional - you can add subscriber count, etc.) */}
            {(userProfile.subscribersCount !== undefined || userProfile.channelsSubscribedToCount !== undefined) && (
              <div className="flex gap-6 mt-6 pt-6 border-t border-gray-700/50">
                {userProfile.subscribersCount !== undefined && (
                  <div>
                    <p className="text-2xl font-bold text-white">{userProfile.subscribersCount}</p>
                    <p className="text-gray-400 text-sm">Subscribers</p>
                  </div>
                )}
                {userProfile.channelsSubscribedToCount !== undefined && (
                  <div>
                    <p className="text-2xl font-bold text-white">{userProfile.channelsSubscribedToCount}</p>
                    <p className="text-gray-400 text-sm">Subscriptions</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="border-t border-gray-700/50 bg-gray-800/50">
            <div className="flex overflow-x-auto hide-scrollbar">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex-1 min-w-[120px] py-4 px-6 font-semibold text-center transition-all ${
                    activeTab === key
                      ? "text-blue-400 border-b-2 border-blue-400 bg-gray-700/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/20"
                  }`}
                >
                  <Icon className="inline mr-2 text-lg" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Posts Tab */}
            {activeTab === TABS.POSTS && (
              <div>
                {content.photos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content.photos.map((photo) => (
                      <Photo
                        key={photo._id}
                        photo={photo.url}
                        morePhoto={photo.morePhoto}
                        fullName={photo.ownerDetails?.fullName}
                        avatar={photo.ownerDetails?.avatar}
                        title={photo.title}
                        description={photo.description}
                        id={photo._id}
                        ownerId={photo.ownerDetails?._id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FaRegFileAlt className="text-gray-600 text-6xl mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No posts yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Shorts Tab */}
            {activeTab === TABS.SHORTS && (
              <div>
                {content.shots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {content.shots.map((shot) => (
                      <ShotComponent
                        key={shot._id}
                        title={shot.title}
                        description={shot.description}
                        thumbnail={shot.thumbnail}
                        id={shot._id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FaRegPlayCircle className="text-gray-600 text-6xl mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No shorts yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === TABS.VIDEOS && (
              <div>
                {content.videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content.videos.map((video) => (
                      <VideoP
                      
                        key={video._id}
                        title={video.title}
                        duration={video.duration}
                        views={video.views}
                        createdAt={video.createdAt}
                        thumbnail={video.thumbnail}
                        id={video._id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FaVideo className="text-gray-600 text-6xl mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No videos yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Playlist Tab */}
            {activeTab === TABS.PLAYLIST && (
              <div>
                {content.playlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {content.playlist.map((playlist) => (
                      <PlayListIcons
                        key={playlist._id}
                        id={playlist._id}
                        videosLength={playlist.videos.length}
                        videoFirst={playlist.videos[0]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FaListAlt className="text-gray-600 text-6xl mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No playlists yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
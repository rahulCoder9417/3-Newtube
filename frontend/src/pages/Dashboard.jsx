import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { onSubmitAxios } from "../utils/axios";
import Photo from "../components/photo/DashboardPhoto";
import ShotComponent from "../components/uni/ShotComponent";
import VideoComponent from "../components/uni/VideoComponent";
import PlayListIcons from "../components/playlist/PlayListIcons";
import VideoP from "../components/uni/Video";

const CATEGORIES = {
  PHOTOS: "photos",
  SHOTS: "shots",
  VIDEOS: "videos",
  PLAYLIST: "playlist",
};

const Dashboard = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [shots, setShots] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.PHOTOS);

  // Fetch user details and initial photos
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, photosResponse] = await Promise.all([
          onSubmitAxios("get", `users/c/${id}`),
          onSubmitAxios("get", "photos/", {}, {}, { userId: id }),
        ]);

        setUserDetails(userResponse.data.data);
        setPhotos(photosResponse.data.data.docs);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInitialData();
    }
  }, [id]);

  // Fetch data based on selected category
  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      try {
        switch (selectedCategory) {
          case CATEGORIES.PHOTOS:
            const photosResponse = await onSubmitAxios(
              "get",
              "photos/",
              {},
              {},
              { userId: id }
            );
            setPhotos(photosResponse.data.data.docs);
            break;

          case CATEGORIES.SHOTS:
            const shotsResponse = await onSubmitAxios(
              "get",
              "videos/",
              {},
              {},
              { userId: id, type: "short" }
            );
            setShots(shotsResponse.data.data);
            break;

          case CATEGORIES.VIDEOS:
            const videosResponse = await onSubmitAxios(
              "get",
              "videos/",
              {},
              {},
              { userId: id, type: "long" }
            );
            setVideos(videosResponse.data.data);
            break;

          case CATEGORIES.PLAYLIST:
            const playlistResponse = await onSubmitAxios(
              "get",
              `playlist/user/${id}`
            );
            setPlaylist(playlistResponse.data.data);
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(`Failed to fetch ${selectedCategory}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && selectedCategory) {
      fetchCategoryData();
    }
  }, [selectedCategory, id]);

  const handleSubscribeToggle = useCallback(async () => {
    try {
      const response = await onSubmitAxios("post", `subscriptions/c/${id}`);
      const isSubscribed = response.data.message === "Subscribed successfully";

      setUserDetails((prev) => ({
        ...prev,
        isSubscribed,
        subscribersCount: isSubscribed
          ? prev.subscribersCount + 1
          : prev.subscribersCount - 1,
      }));
    } catch (error) {
      console.error("Error toggling subscription:", error);
      alert("Failed to toggle subscription. Please try again.");
    }
  }, [id]);

  const categoryButtons = [
    { key: CATEGORIES.PHOTOS, label: "Photos" },
    { key: CATEGORIES.SHOTS, label: "Shots" },
    { key: CATEGORIES.VIDEOS, label: "Videos" },
    { key: CATEGORIES.PLAYLIST, label: "Playlist" },
  ];

  if (isLoading && !userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-teal-200 p-4 md:p-6">
      {/* User Profile Section */}
      {userDetails && (
        <div className="max-w-7xl mx-auto mb-8">
          {/* Cover Image */}
          {userDetails.coverImage && (
            <div
              className="h-48 md:h-64 bg-cover bg-center rounded-lg border border-teal-600 shadow-lg"
              style={{ backgroundImage: `url(${userDetails.coverImage})` }}
            />
          )}

          {/* User Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
            <img
              src={userDetails.avatar}
              alt={userDetails.fullName}
              className="w-20 h-20 rounded-full border-4 border-teal-500 shadow-lg"
            />

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-teal-300">
                {userDetails.fullName}
              </h1>
              <p className="text-teal-400 text-sm md:text-base">
                @{userDetails.username}
              </p>
              <p className="text-teal-400 text-sm">{userDetails.email}</p>
              <p className="text-teal-400 text-sm mt-1">
                <span className="font-semibold">
                  {userDetails.subscribersCount}
                </span>{" "}
                subscribers •{" "}
                <span className="font-semibold">
                  {userDetails.channelsSubscribedToCount}
                </span>{" "}
                subscriptions
              </p>
            </div>

            <button
              onClick={handleSubscribeToggle}
              className={`px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                userDetails.isSubscribed
                  ? "bg-teal-700 hover:bg-teal-600 text-white"
                  : "bg-teal-500 hover:bg-teal-400 text-white"
              }`}
            >
              {userDetails.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-3">
          {categoryButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                selectedCategory === key
                  ? "bg-teal-500 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-teal-300 hover:bg-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-3"></div>
              <p className="text-teal-400">Loading {selectedCategory}...</p>
            </div>
          </div>
        ) : (
          <>
            {selectedCategory === CATEGORIES.PHOTOS && (
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-6">
                  Photos
                </h2>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photos.map((photo) => (
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
                  <p className="text-gray-500 text-center py-10">
                    No photos available
                  </p>
                )}
              </div>
            )}

            {selectedCategory === CATEGORIES.SHOTS && (
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-6">Shots</h2>
                {shots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {shots.map((shot) => (
                      <ShotComponent
                        key={shot._id}
                        id={shot._id}
                        title={shot.title}
                        description={shot.description}
                        thumbnail={shot.thumbnail}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">
                    No shots available
                  </p>
                )}
              </div>
            )}

            {selectedCategory === CATEGORIES.VIDEOS && (
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-6">
                  Videos
                </h2>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <VideoP
                        key={video._id}
                        title={video.title}
                        id={video._id}
                        views={video.views}
                        duration={video.duration}
                        createdAt={video.createdAt}
                        thumbnail={video.thumbnail}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">
                    No videos available
                  </p>
                )}
              </div>
            )}

            {selectedCategory === CATEGORIES.PLAYLIST && (
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-6">
                  Playlist
                </h2>
                {playlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlist.map((item) => (
                      <PlayListIcons
                        key={item._id}
                        id={item._id}
                        videosLength={item.videos.length}
                        videoFirst={item.videos[0]}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">
                    No playlists available
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
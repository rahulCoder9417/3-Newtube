import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onSubmitAxios } from "../utils/axios"; 
import Photo from "../components/photo/Photo";
import ShotComponent from "../components/uni/ShotComponent";
import VideoComponent from "../components/uni/VideoComponent";
import PlayListIcons from "../components/playlist/PlayListIcons";

const Dashboard = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [shots, setShots] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("photos");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await onSubmitAxios("get", `users/c/${id}`);
        setUserDetails(response.data.data);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    const fetchPhotos = async () => {
      try {
        const response = await onSubmitAxios("get", "photos/", {}, {}, { userId: id });
        setPhotos(response.data.data.docs);
      } catch (err) {
        console.error("Failed to fetch photos:", err);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUserDetails(), fetchPhotos()]);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    if (selectedCategory === "photos") {
      onSubmitAxios("get", "photos/", {}, {}, { userId: id })
        .then((response) => setPhotos(response.data.data.docs))
        .catch((err) => console.error("Failed to fetch photos:", err));
    } else if (selectedCategory === "shots") {
      onSubmitAxios("get", "videos/", {}, {}, { userId: id, type: "short" })
        .then((response) => setShots(response.data.data))
        .catch((err) => console.error("Failed to fetch shots:", err));
    } else if (selectedCategory === "videos") {
      onSubmitAxios("get", "videos/", {}, {}, { userId: id, type: "long" })
        .then((response) => setVideos(response.data.data))
        .catch((err) => console.error("Failed to fetch videos:", err));
    } else if (selectedCategory === "playlist") {
      onSubmitAxios("get", `playlist/user/${id}`)
        .then((response) => setPlaylist(response.data.data))
        .catch((err) => console.error("Failed to fetch playlist:", err));
    }
    setIsLoading(false);
  }, [selectedCategory, id]);

  const handleSubscribeToggle = async () => {
    try {
      const response = await onSubmitAxios("post", `subscriptions/c/${id}`);
      if (response.data.message === "Subscribed successfully") {
        setUserDetails((prevState) => ({
          ...prevState,
          isSubscribed: true,
          subscribersCount: prevState.subscribersCount + 1,
        }));
      } else if (response.data.message === "Unsubscribed successfully") {
        setUserDetails((prevState) => ({
          ...prevState,
          isSubscribed: false,
          subscribersCount: prevState.subscribersCount - 1,
        }));
      }
    } catch (error) {
      console.error("Error while toggling subscription:", error);
      alert("Failed to toggle subscription. Please try again.");
    }
  };

  if (isLoading) return <div className="text-green-500">Loading...</div>;

  return (
    <div className="p-4 bg-gray-900 text-teal-200 min-h-screen">
      {userDetails && (
        <div>
          {userDetails.coverImage && (
            <div
              className="h-64 bg-cover bg-center rounded-lg border border-teal-600 object-cover"
              style={{ backgroundImage: `url(${userDetails.coverImage})` }}
            ></div>
          )}
          <div className="flex items-center mt-4">
            <img
              src={userDetails.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-teal-500"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-teal-300">{userDetails.fullName}</h1>
              <p className="text-teal-400">@{userDetails.username}</p>
              <p className="text-teal-400">{userDetails.email}</p>
              <p className="text-teal-400">
                {userDetails.subscribersCount} subscribers • {userDetails.channelsSubscribedToCount} subscriptions
              </p>
            </div>
            <button
              onClick={handleSubscribeToggle}
              className={`ml-auto px-4 py-2 rounded-lg ${
                userDetails.isSubscribed
                  ? "bg-teal-700 text-white"
                  : "bg-teal-500 text-white"
              }`}
            >
              {userDetails.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => setSelectedCategory("photos")}
          className={`px-4 py-2 rounded-lg mr-4 ${
            selectedCategory === "photos" ? "bg-teal-500 text-white" : "bg-gray-700 text-teal-300"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setSelectedCategory("shots")}
          className={`px-4 py-2 rounded-lg mr-4 ${
            selectedCategory === "shots" ? "bg-teal-500 text-white" : "bg-gray-700 text-teal-300"
          }`}
        >
          Shots
        </button>
        <button
          onClick={() => setSelectedCategory("videos")}
          className={`px-4 py-2 rounded-lg ${
            selectedCategory === "videos" ? "bg-teal-500 text-white" : "bg-gray-700 text-teal-300"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setSelectedCategory("playlist")}
          className={`px-4 py-2 ml-3 rounded-lg ${
            selectedCategory === "playlist" ? "bg-teal-500 text-white" : "bg-gray-700 text-teal-300"
          }`}
        >
          Playlist
        </button>
      </div>

      <div className="mt-8">
        {selectedCategory === "photos" && (
          <>
            <h2 className="text-xl font-bold text-teal-300">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {photos.map((photo) => (
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
            </div>
          </>
        )}

        {selectedCategory === "shots" && (
          <>
            <h2 className="text-xl font-bold text-teal-300">Shots</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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
          </>
        )}

        {selectedCategory === "videos" && (
          <>
            <h2 className="text-xl font-bold text-teal-300">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {videos.map((video) => (
                <VideoComponent
                  key={video._id}
                  title={video.title}
                  description={video.description}
                  id={video._id}
                  thumbnail={video.thumbnail}
                />
              ))}
            </div>
          </>
        )}
        {selectedCategory === "playlist" && (
          <>
            <h2 className="text-xl font-bold text-teal-300">Playlist</h2>
            <div className="grid grid-cols-4  gap-4 mt-4">
              {playlist.length > 0 &&
                playlist.map((i) => (
                  <PlayListIcons id={i._id} videosLength={i.videos.length} videoFirst={i.videos[0]} />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

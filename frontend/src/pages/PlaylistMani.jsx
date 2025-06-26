import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Notifier from "../components/uni/Notifier";
import { onSubmitAxios } from "../utils/axios";

function PlaylistMani() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  // Fetch the playlist details
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const response = await onSubmitAxios("get", `playlist/${id}`);
        setPlaylist(response.data.data);
        setName(response.data.data.name);
        setDescription(response.data.data.description);
      } catch (error) {
        console.error("Failed to fetch playlist details", error);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  // Handle playlist update
  const updatePlaylist = async () => {
    try {
      const data = { name, description };
      setVisible(true);
      setLoad(true);
      await onSubmitAxios("patch", `playlist/${id}`, data);
      setLoad(false);
      setMessage("success");
      setPlaylist({ ...playlist, name, description });
    } catch (error) {
      setLoad(false);
      setMessage("error");
      console.error("Error updating playlist", error);
    }
  };

  // Handle playlist deletion
  const deletePlaylist = async () => {
    try {
      await onSubmitAxios("delete", `playlist/${id}`);
      alert("Playlist deleted successfully");
      navigate("/home"); // Redirect to homepage after deletion
    } catch (error) {
      console.error("Error deleting playlist", error);
    }
  };

  // Handle removing video from playlist
  const removeVideoFromPlaylist = async (videoId) => {
    try {
      setVisible(true);
      setLoad(true);
      await onSubmitAxios("patch", `playlist/remove/${videoId}/${id}`);
      setPlaylist({...playlist, videos: playlist.videos.filter((v) => v._id !== videoId)});
      setLoad(false);
      setMessage("success");
    } catch (error) {
      setLoad(false);
      setMessage("error");
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8  min-h-screen shadow-lg">
      {visible && (
        <Notifier
          type={message}
          message={
            message === "error" ? "Error in updation" : "Updation Success"
          }
          loading={load}
          setV={setVisible}
        />
      )}
      {playlist ? (
        <div className="flex flex-col gap-8">
          {/* Playlist Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold">{playlist.name}</h2>

            <textarea
              className="bg-gray-800 text-white p-4 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Update playlist name"
            />
            <textarea
              className="bg-gray-800 text-white p-4 rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Update playlist description"
            />
            <div className="flex gap-4">
              <button
                onClick={updatePlaylist}
                className="bg-green-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-700"
              >
                Update Playlist
              </button>
              <button
                onClick={deletePlaylist}
                className="bg-red-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-700"
              >
                Delete Playlist
              </button>
            </div>
          </div>

          {/* Videos List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Videos in Playlist</h3>
            {playlist.videos.map((video) => (
              <div
                key={video._id}
                className="flex items-center justify-between bg-gray-800 p-4 rounded-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={video.thumbnail}
                    alt="Thumbnail"
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{video.title}</h4>
                    <p className="text-sm text-gray-400">
                      {video.owner.fullName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeVideoFromPlaylist(video._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
                >
                  Remove Video
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading playlist details...</p>
      )}
    </div>
  );
}

export default PlaylistMani;

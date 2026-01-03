import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useSelector } from "react-redux";
import { onSubmitAxios } from "../../utils/axios";

function VideoThreeDots({videoId,videoRef}) {
  const userId = useSelector((state) => state.auth.id);
  const [newName, setNewName] = useState("");
  const [showOptions, setShowOptions] = useState(false); // State to toggle the options menu
  const [playlists, setPlaylists] = useState([]); // State to store user's playlists
  const [isInPlaylist, setIsInPlaylist] = useState({}); // State to track if video is in playlist
  const fetchPlaylists = async () => {
    try {
      const response = await onSubmitAxios("get", `playlist/user/${userId}`);
      setPlaylists(response.data.data);
      const updatedIsInPlaylist = {};
      response.data.data.forEach((playlist) => {
        updatedIsInPlaylist[playlist.name] = playlist.videos.includes(videoId);
      });
      setIsInPlaylist(updatedIsInPlaylist);
    } catch (error) {
      console.error("Error fetching playlists", error);
    }
  };
  const toggleOptions = () => {
    console.log("toggleOptions");
    fetchPlaylists();
    setShowOptions((prev) => !prev);
    console.log(showOptions);
  };
  const handlePlaylistSelect = async (name, checked, playId) => {
    if (checked) {
      setIsInPlaylist({ ...isInPlaylist, [name]: true });
      await onSubmitAxios("patch", `playlist/add/${videoId}/${playId}`);
    } else {
      setIsInPlaylist({ ...isInPlaylist, [name]: false });
      await onSubmitAxios("patch", `playlist/remove/${videoId}/${playId}`);
    }
  };
  // Create new playlist
  const createNewPlaylist = async (
    name = "New play",
    description = "it is des"
  ) => {
    try {
      await onSubmitAxios("post", `playlist/`, { name, description });
      fetchPlaylists();
    } catch (error) {
      console.error("Error creating playlist", error);
    }
  };

  useEffect(() => {
    if (!showOptions) return;
  
    const handleClickOutside = (event) => {
      if (
        videoRef.current &&
        !videoRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);
  return (
    <div className="">
      <div
        className="absolute bottom-10 right-2 text-white cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          toggleOptions();
        }}
      >
        <FaEllipsisV />
      </div>

      {/* Options Menu */}
      {showOptions && (
        <div  className="relative rounded-lg  bottom-20  right-3 bg-gray-800 text-white p-2  shadow-lg w-64">
          <div className="mb-2">
            <h5 className="text-sm font-semibold">Select Playlists</h5>
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div key={playlist._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isInPlaylist[playlist.name]}
                    onChange={(e) =>
                      handlePlaylistSelect(
                        playlist.name,
                        e.target.checked,
                        playlist._id
                      )
                    }
                  />
                  <span>{playlist.name}</span>
                </div>
              ))
            ) : (
              <p>No playlists available</p>
            )}
          </div>

          {/* Create new playlist */}
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New Playlist Name"
            className="w-full rounded-2xl border-gray-800 border-2 bg-slate-600 px-2 py-1 mb-2"
          />
          <button
            className="block w-full text-left px-2 py-1 hover:bg-gray-700"
            onClick={() => createNewPlaylist(newName)}
          >
            Create Playlist
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoThreeDots;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Notifier from "../components/uni/Notifier";
import { onSubmitAxios } from "../utils/axios";

function Updation() {
  const id = useSelector((state) => state.auth.id);
  const [data, setData] = useState([]);
  const [preference, setPreference] = useState("video");
  const [notification, setNotification] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    item: null,
  });
  const navigate = useNavigate();

  const op = (type, id) => {
    const queryParams = new URLSearchParams({ type }).toString();
    navigate(`/manipulate/${id}?${queryParams}`);
  };

  const fetchData = async () => {
    setNotification({ type: "loading", message: "Fetching data..." });
    try {
      let endpoint = "";
      let params = { userId: id };

      if (preference === "video") {
        endpoint = "videos/";
        params.type = "long";
      } else if (preference === "Shot") {
        endpoint = "videos/";
        params.type = "short";
      } else if (preference === "Photo") {
        endpoint = "photos/";
      }

      const response = await onSubmitAxios("get", endpoint, {}, {}, params);
      setData(preference === "Photo" ? response.data.data.docs : response.data.data);
    } catch (error) {
      setNotification({ type: "error", message: "Failed to fetch data." });
    } finally {
      setNotification(null);
    }
  };

  const confirmDelete = (item) => {
    setDeleteConfirmation({ show: true, item });
  };

  const handleDelete = async () => {
    const item = deleteConfirmation.item;
    const endpoint =
      preference === "Photo"
        ? `photos/${item._id}`
        : `videos/videoManupulate/${item._id}`;
    setNotification({ type: "loading", message: "Deleting item..." });

    try {
      await onSubmitAxios("delete", endpoint);
      setData(data.filter((i) => i._id !== item._id));
      setNotification({ type: "success", message: "Item deleted successfully!" });
    } catch (error) {
      setNotification({ type: "error", message: "Failed to delete item." });
    } finally {
      setDeleteConfirmation({ show: false, item: null });
      setNotification(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, preference]);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center space-x-4">
        <label className="text-gray-400 font-medium">Select Type:</label>
        <select
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          className="px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-teal-500"
        >
          <option value="video">Video</option>
          <option value="Shot">Shot</option>
          <option value="Photo">Photo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className={`p-4 ${preference === "Shot" ? "w-56 h-96" : "w-72 h-80"} bg-gray-800 border border-gray-700 rounded-md hover:bg-teal-700 cursor-pointer shadow-sm transition duration-200 space-y-3`}
          >
            <img
              src={
                item.thumbnail
                  ? item.thumbnail // Video or Shot
                  : item.url // Photo
              }
              alt={item.title}
              className=" w-full h-[75%] object-cover rounded-md"
            />
            <h3 className="font-semibold text-lg text-gray-300 truncate">
              {item.title}
            </h3>
            <div className="flex justify-between items-center">
              <button
                onClick={() => op(preference === "Photo" ? "photo" : "video", item._id)}
                className="text-sm text-teal-400 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(item)}
                className="px-2 py-1 text-sm text-red-500 bg-gray-700 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {notification && (
        <Notifier
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          loading={notification.type === "loading"}
        />
      )}

      {deleteConfirmation.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 space-y-4 w-96">
            <h3 className="text-xl text-gray-300 font-semibold">
              Are you sure you want to delete this item?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation({ show: false, item: null })}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Updation;

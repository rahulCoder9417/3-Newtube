import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { onSubmitAxios } from "../utils/axios";
import { uploadToCloudinary } from "../utils/cloudinary";
function Manipulation() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [type, setType] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    thumbnailLocal: null,
  });

  useEffect(() => {
    const type = queryParams.get("type");
    setType(type);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, thumbnailLocal: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      if (type === "video") {
        form.append("tags", formData.tags);
        if (formData.thumbnailLocal) {
     
            const cloudinaryResponse = await uploadToCloudinary(formData.thumbnailLocal, "image");
         ;
          
          form.append("thumbnail",  cloudinaryResponse.secure_url);
        }
      }

      const endpoint =
        type === "photo" ? `photos/${id}` : `videos/videoManupulate/${id}`;
      setLoading(true);
      const response = await onSubmitAxios("patch", endpoint, form);
      setLoading(false);
      console.log("Update successful:", response.data);
    } catch (error) {
      console.error("Error updating data:", error);
      setLoading(false);
    }
  };

  return (<div className="w-full min-h-screen p-5 bg-gray-800">
    <div className="max-w-3xl mx-auto bg-gray-900 top-5  text-white shadow-lg rounded-lg p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center">
        {type === "photo" ? "Update Photo" : "Update Video"}
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="block w-full mt-2 px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:outline-none transition duration-200"
            placeholder={`Enter the ${type} title`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="block w-full mt-2 px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:outline-none transition duration-200"
            placeholder={`Enter the ${type} description`}
            rows="4"
          ></textarea>
        </div>
        {type === "video" && (
          <>
            <div>
              <label className="block text-sm font-medium">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="block w-full mt-2 px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:outline-none transition duration-200"
                placeholder="Enter tags separated by commas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full mt-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition duration-200"
              />
            </div>
          </>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 px-4 font-medium rounded-lg shadow-lg transition duration-200 ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {loading
          ? "Updating..."
          : type === "photo"
          ? "Update Photo"
          : "Update Video"}
      </button>
      {loading && (
        <div className="flex items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}
    </div></div>
  );
}

export default Manipulation;

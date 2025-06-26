import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { onSubmitAxios } from "../utils/axios";

function Uploading() {
  const [choice, setChoice] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const { handleSubmit, reset } = useForm();
  const [thumb, setThumb] = useState(false);
  const tagOptions = ["Music", "Education", "Comedy", "Tech", "Sports"];
  const videoFileRef = useRef(null);
  useEffect(() => {
    console.log(formData)
    console.log(videoFileRef)
    const generateThumbnail = (videoFile) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(videoFile);
    
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
    
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
    
          const ctx = canvas.getContext("2d");
          video.currentTime = 0; // Seek to the first frame
    
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                const thumbnailFile = new File([blob], "thumbnail.png", {
                  type: "image/png",
                });
                resolve(thumbnailFile); // Resolve with the generated thumbnail file
              },
              "image/png"
            );
          };
    
          video.onerror = (error) => {
            console.error("Error seeking video:", error);
            reject(error);
          };
        };
    
        video.onerror = (error) => {
          console.error("Error loading video:", error);
          reject(error);
        };
      });
    };
    const handleGenerateThumbnail = async (videoFile) => {
      try {
        const thumbnailFile = await generateThumbnail(videoFile);
        handleInputChange("thumbnail", thumbnailFile); // Save the thumbnail to formData
        console.log("Thumbnail generated successfully:", thumbnailFile);
      } catch (error) {
        console.error("Error generating thumbnail:", error);
      }
    };
    if (thumb) {
      handleGenerateThumbnail(videoFileRef.current)
    }
    
  }, [thumb]);

  const handleChoiceSelection = (type) => {
    setChoice(type);
    setFormData({});
    setSelectedTags([]);
  };

  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const calculateVideoDuration = (file) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      handleInputChange("duration", Math.floor(video.duration));
    };
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const onSubmit = async () => {
    setLoading(true);
    const finalFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "files" || key === "photos") {
        formData[key].forEach((file) => finalFormData.append(key, file));
      } else {
        finalFormData.append(key, formData[key]);
      }
    });

    if (choice === "longVideo" || choice === "shortVideo") {
      finalFormData.append(
        "videoType",
        choice === "longVideo" ? "long" : "short"
      );
    }
    if (selectedTags.length > 0) {
      finalFormData.append("tags", selectedTags.join("."));
    }

    try {
      const response = await onSubmitAxios(
        "post",
        choice === "photos" ? "photos/" : "videos/",
        finalFormData
      );
      console.log(response);
    } catch (error) {
      console.error("Error while uploading:", error);
    } finally {
      setLoading(false);
      reset();
      setFormData({});
      setSelectedTags([]);
    }
  };

  const renderForm = () => {
    switch (choice) {
      case "longVideo":
      case "shortVideo":
        return (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block mb-1 font-medium text-white">
                Video File
              </label>
              <input
                type="file"
                accept="video/*"

                onChange={(e) => {
                  handleInputChange("videoFile", e.target.files[0]);
                  calculateVideoDuration(e.target.files[0]);
                  videoFileRef.current = e.target.files[0]; 
                }}
                className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={thumb}
                    onChange={() => setThumb(!thumb)}
                    className="mr-2"
                  />
                  Use the first frame of the video as the thumbnail
                </label>
              </div>
            {!thumb && (
              <div>
                <label className="block mb-1 font-medium text-white">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange("thumbnail", e.target.files[0])
                  }
                  className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
                  required
                />
              </div>
            )}
            <div>
              <label className="block mb-1 font-medium text-white">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-white">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-2 rounded-md ${
                      selectedTags.includes(tag)
                        ? "bg-green-500"
                        : "bg-gray-500"
                    } text-white`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-white">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : `Upload ${choice === "longVideo" ? "Long" : "Short"} Video`}
            </button>
          </form>
        );

      case "photos":
        return (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block mb-1 font-medium text-white">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-white">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-white">
                Photos
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  handleInputChange("photos", Array.from(e.target.files))
                }
                className="block w-full border bg-gray-700 text-white rounded-md px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Photos"}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Upload Media</h1>
      <div className="max-w-3xl mx-auto bg-gray-900 shadow-lg rounded-lg p-6">
        {loading && (
          <div className="text-center mb-4">
            <p className="text-blue-400">Uploading, please wait...</p>
          </div>
        )}
        {!choice ? (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold mb-4">
              What do you want to upload?
            </h2>
            <div className="flex justify-around">
              <button
                onClick={() => handleChoiceSelection("longVideo")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
              >
                Long Video
              </button>
              <button
                onClick={() => handleChoiceSelection("shortVideo")}
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
              >
                Short Video
              </button>
              <button
                onClick={() => handleChoiceSelection("photos")}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-600"
              >
                Photos
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <button
                onClick={() => setChoice("")}
                className="text-blue-400 hover:underline"
              >
                ← Back to Choices
              </button>
            </div>
            {renderForm()}
          </>
        )}
      </div>
    </div>
  );
}

export default Uploading;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  FaVideo,
  FaCamera,
  FaImage,
  FaUpload,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
  FaPlay,
} from "react-icons/fa";
import { onSubmitAxios } from "../utils/axios";
import { uploadToCloudinary } from "../utils/cloudinary";
const TAG_OPTIONS = ["Music", "Education", "Comedy", "Tech", "Sports"];

const UPLOAD_TYPES = {
  LONG_VIDEO: "longVideo",
  SHORT_VIDEO: "shortVideo",
  PHOTOS: "photos",
};

const Uploading = () => {
  const [uploadType, setUploadType] = useState("");
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [autoGenerateThumbnail, setAutoGenerateThumbnail] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    video: null,
    thumbnail: null,
    photos: [],
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { handleSubmit, reset } = useForm();
  const videoFileRef = useRef(null);

  // Generate thumbnail from video
  const generateThumbnail = useCallback((videoFile) => {
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
        video.currentTime = 0;

        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              const thumbnailFile = new File([blob], "thumbnail.png", {
                type: "image/png",
              });
              resolve(thumbnailFile);
            },
            "image/png"
          );
        };

        video.onerror = reject;
      };

      video.onerror = reject;
    });
  }, []);

  // Auto-generate thumbnail when enabled
  useEffect(() => {
    const handleAutoThumbnail = async () => {
      if (autoGenerateThumbnail && videoFileRef.current) {
        try {
          const thumbnailFile = await generateThumbnail(videoFileRef.current);
          handleInputChange("thumbnail", thumbnailFile);
          setUploadedFiles((prev) => ({ ...prev, thumbnail: thumbnailFile }));
        } catch (error) {
          console.error("Error generating thumbnail:", error);
        }
      }
    };

    handleAutoThumbnail();
  }, [autoGenerateThumbnail, generateThumbnail]);

  const handleUploadTypeSelection = useCallback((type) => {
    setUploadType(type);
    setFormData({});
    setSelectedTags([]);
    setUploadedFiles({ video: null, thumbnail: null, photos: [] });
    setAutoGenerateThumbnail(false);
    setUploadSuccess(false);
  }, []);

  const handleInputChange = useCallback((key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  }, []);

  const calculateVideoDuration = useCallback(
    (file) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        handleInputChange("duration", Math.floor(video.duration));
      };
    },
    [handleInputChange]
  );

  const handleVideoFileChange = useCallback(
    (file) => {
      handleInputChange("videoFile", file);
      calculateVideoDuration(file);
      videoFileRef.current = file;
      setUploadedFiles((prev) => ({ ...prev, video: file }));
    },
    [handleInputChange, calculateVideoDuration]
  );

  const handleThumbnailChange = useCallback(
    (file) => {
      handleInputChange("thumbnail", file);
      setUploadedFiles((prev) => ({ ...prev, thumbnail: file }));
    },
    [handleInputChange]
  );

  const handlePhotosChange = useCallback(
    (files) => {
      const filesArray = Array.from(files);
      handleInputChange("photos", filesArray);
      setUploadedFiles((prev) => ({ ...prev, photos: filesArray }));
    },
    [handleInputChange]
  );

  const removeFile = useCallback((type) => {
    setUploadedFiles((prev) => ({ ...prev, [type]: null }));
    handleInputChange(type === "video" ? "videoFile" : type, null);
  }, [handleInputChange]);

  const removePhoto = useCallback(
    (index) => {
      setUploadedFiles((prev) => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index),
      }));
      handleInputChange(
        "photos",
        uploadedFiles.photos.filter((_, i) => i !== index)
      );
    },
    [uploadedFiles.photos, handleInputChange]
  );

  const handleTagClick = useCallback((tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  }, []);

  const onSubmit = async () => {
    console.log("🔵 [UPLOAD] Starting upload process...");
    console.log("🔵 [UPLOAD] Upload type:", uploadType);
    setIsLoading(true);

    try {
      let videoUrl, thumbnailUrl, photoUrls = [];

      // ===== VIDEO UPLOADS =====
      if (uploadType === UPLOAD_TYPES.LONG_VIDEO || uploadType === UPLOAD_TYPES.SHORT_VIDEO) {
     
        if (uploadedFiles.video) {
          const videoResult = await uploadToCloudinary(uploadedFiles.video, "video");
          videoUrl = videoResult.secure_url;
        }

        if (uploadedFiles.thumbnail) {
          const thumbnailResult = await uploadToCloudinary(uploadedFiles.thumbnail, "image");
          thumbnailUrl = thumbnailResult.secure_url;
        }
      }

      // ===== PHOTO UPLOADS =====
      if (uploadType === UPLOAD_TYPES.PHOTOS) {
        if (uploadedFiles.photos.length > 0) {
          const photoPromises = uploadedFiles.photos.map(photo => 
            uploadToCloudinary(photo, "image")
          );
          const photoResults = await Promise.all(photoPromises);
          photoUrls = photoResults.map(result => result.secure_url);
        }
      }

      // ===== PREPARE DATA FOR BACKEND =====
      const backendData = new FormData();

      if (uploadType === UPLOAD_TYPES.LONG_VIDEO || uploadType === UPLOAD_TYPES.SHORT_VIDEO) {
        backendData.append("title", formData.title);
        backendData.append("description", formData.description);
        backendData.append("videoFile", videoUrl);
        backendData.append("thumbnail", thumbnailUrl);
        backendData.append("duration", formData.duration);
        backendData.append("videoType", uploadType === UPLOAD_TYPES.LONG_VIDEO ? "long" : "short");
        
        if (selectedTags.length > 0) {
          backendData.append("tags", selectedTags.join("."));
        }
      } else if (uploadType === UPLOAD_TYPES.PHOTOS) {
        backendData.append("title", formData.title);
        backendData.append("description", formData.description);
        backendData.append("url", photoUrls[0]); 
        
        if (photoUrls.length > 1) {
          backendData.append("morePhoto", JSON.stringify(photoUrls.slice(1)));
        }
      }

      const endpoint = uploadType === UPLOAD_TYPES.PHOTOS ? "photos/" : "videos/";
      await onSubmitAxios("post", endpoint, backendData);
      
      setUploadSuccess(true);

      setTimeout(() => {
        reset();
        setFormData({});
        setSelectedTags([]);
        setUploadedFiles({ video: null, thumbnail: null, photos: [] });
        setUploadType("");
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("❌ [UPLOAD] Upload failed:", error);
      console.error("❌ [UPLOAD] Error details:", error.response?.data);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const FilePreview = ({ file, type, onRemove }) => {
    if (!file) return null;

    const isImage = file.type?.startsWith("image/");
    const isVideo = file.type?.startsWith("video/");

    return (
      <div className="relative group bg-gray-700 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center gap-3">
          {isImage && (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-20 h-20 object-cover rounded"
            />
          )}
          {isVideo && (
            <div className="relative w-20 h-20 bg-black rounded flex items-center justify-center">
              <FaPlay className="text-white text-2xl" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{file.name}</p>
            <p className="text-gray-400 text-xs">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderVideoForm = () => (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Video File */}
      <div>
        <label className=" mb-2 font-semibold text-white flex items-center gap-2">
          <FaVideo />
          Video File
        </label>
        {!uploadedFiles.video ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition">
            <FaUpload className="text-gray-400 text-3xl mb-2" />
            <span className="text-gray-400">Click to upload video</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoFileChange(e.target.files[0])}
              className="hidden"
              required
            />
          </label>
        ) : (
          <FilePreview
            file={uploadedFiles.video}
            type="video"
            onRemove={() => removeFile("video")}
          />
        )}
      </div>

      {/* Auto-generate Thumbnail */}
      <div className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg">
        <input
          type="checkbox"
          id="autoThumbnail"
          checked={autoGenerateThumbnail}
          onChange={() => setAutoGenerateThumbnail(!autoGenerateThumbnail)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="autoThumbnail" className="text-white cursor-pointer">
          Auto-generate thumbnail from first frame
        </label>
      </div>

      {/* Thumbnail Upload */}
      {!autoGenerateThumbnail && (
        <div>
          <label className="block mb-2 font-semibold text-white flex items-center gap-2">
            <FaImage />
            Thumbnail
          </label>
          {!uploadedFiles.thumbnail ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition">
              <FaImage className="text-gray-400 text-3xl mb-2" />
              <span className="text-gray-400">Click to upload thumbnail</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailChange(e.target.files[0])}
                className="hidden"
                required
              />
            </label>
          ) : (
            <FilePreview
              file={uploadedFiles.thumbnail}
              type="thumbnail"
              onRemove={() => removeFile("thumbnail")}
            />
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block mb-2 font-semibold text-white">Title</label>
        <input
          type="text"
          placeholder="Enter video title"
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block mb-2 font-semibold text-white">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTags.includes(tag)
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 font-semibold text-white">
          Description
        </label>
        <textarea
          placeholder="Enter video description"
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
          rows="4"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Uploading...
          </>
        ) : (
          <>
            <FaUpload />
            Upload {uploadType === UPLOAD_TYPES.LONG_VIDEO ? "Long" : "Short"} Video
          </>
        )}
      </button>
    </form>
  );

  const renderPhotosForm = () => (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Title */}
      <div>
        <label className="block mb-2 font-semibold text-white">Title</label>
        <input
          type="text"
          placeholder="Enter photo album title"
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 font-semibold text-white">
          Description
        </label>
        <textarea
          placeholder="Enter photo description"
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
          rows="4"
          required
        />
      </div>

      {/* Photos Upload */}
      <div>
        <label className="block mb-2 font-semibold text-white  items-center gap-2">
          <FaCamera />
          Photos (Multiple)
        </label>
        {uploadedFiles.photos.length === 0 ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition">
            <FaCamera className="text-gray-400 text-3xl mb-2" />
            <span className="text-gray-400">Click to upload photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handlePhotosChange(e.target.files)}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-2">
            {uploadedFiles.photos.map((photo, index) => (
              <FilePreview
                key={index}
                file={photo}
                type="photo"
                onRemove={() => removePhoto(index)}
              />
            ))}
            <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition">
              <FaCamera className="text-gray-400 mr-2" />
              <span className="text-gray-400">Add more photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  handlePhotosChange([
                    ...uploadedFiles.photos,
                    ...Array.from(e.target.files),
                  ])
                }
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Uploading...
          </>
        ) : (
          <>
            <FaUpload />
            Upload Photos
          </>
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Upload Media
        </h1>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-xl p-6 md:p-8 border border-gray-700">
          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-6 bg-green-600 text-white p-4 rounded-lg flex items-center gap-3">
              <FaCheckCircle size={24} />
              <span className="font-semibold">Upload successful!</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-6 bg-blue-600 text-white p-4 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="font-semibold">Uploading, please wait...</span>
            </div>
          )}

          {/* Type Selection */}
          {!uploadType ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-6">
                What would you like to upload?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleUploadTypeSelection(UPLOAD_TYPES.LONG_VIDEO)}
                  className="flex flex-col items-center justify-center p-8 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all hover:scale-105 group"
                >
                  <FaVideo className="text-5xl mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-bold">Long Video</span>
                  <span className="text-sm text-blue-200 mt-1">
                    Full-length content
                  </span>
                </button>

                <button
                  onClick={() => handleUploadTypeSelection(UPLOAD_TYPES.SHORT_VIDEO)}
                  className="flex flex-col items-center justify-center p-8 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg transition-all hover:scale-105 group"
                >
                  <FaCamera className="text-5xl mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-bold">Short Video</span>
                  <span className="text-sm text-green-200 mt-1">
                    Quick clips
                  </span>
                </button>

                <button
                  onClick={() => handleUploadTypeSelection(UPLOAD_TYPES.PHOTOS)}
                  className="flex flex-col items-center justify-center p-8 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg transition-all hover:scale-105 group"
                >
                  <FaImage className="text-5xl mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-bold">Photos</span>
                  <span className="text-sm text-purple-200 mt-1">
                    Image gallery
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Back Button */}
              <button
                onClick={() => handleUploadTypeSelection("")}
                className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
              >
                <FaArrowLeft />
                Back to type selection
              </button>

              {/* Forms */}
              {(uploadType === UPLOAD_TYPES.LONG_VIDEO || uploadType === UPLOAD_TYPES.SHORT_VIDEO) &&
                renderVideoForm()}
              {uploadType === UPLOAD_TYPES.PHOTOS && renderPhotosForm()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Uploading;
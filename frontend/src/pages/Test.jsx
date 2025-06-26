import React, { useState } from "react";
import { onSubmitAxios } from "../utils/axios";

const Test = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [formData, setFormData] = useState({
    title: "hi",
    tags: "hi.i.am",
    description: "nks",
    duration: "111111",
    videoType: "short",
  });

  const handleVideoChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleThumbnailChange = (event) => {
    setThumbnail(event.target.files[0]);
  };



  const handleSubmit = async(e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("videoFile", videoFile);
    data.append("thumbnail", thumbnail);
    data.append("tags", formData.tags);
    data.append("description", formData.description);
    data.append("duration", formData.duration);
    data.append("videoType", formData.videoType);

    // You can use this FormData to make an API request
    console.log("FormData prepared:", data);
    try {
      const response = await onSubmitAxios("post","videos/",data);
      console.log(response)
    } catch (error) {
      
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Video File:
          <input type="file" accept="video/*" onChange={handleVideoChange} />
        </label>
      </div>
      <div>
        <label>
          Thumbnail:
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Test;

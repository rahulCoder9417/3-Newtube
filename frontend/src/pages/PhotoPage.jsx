import React, { useEffect, useState } from "react";
import Photo from "../components/photo/Photo";
import { onSubmitAxios } from "../utils/axios";

function PhotoPage() {
  const [photos, setPhotos] = useState([]); // Store the photos
  const [page, setPage] = useState(1); // Current page for pagination
  const [hasMore, setHasMore] = useState(true); // Check if more photos are available
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // Fetch photos from API
  const fetchPhotos = async (currentPage) => {
    setIsLoading(true);
    try {
      const response = await onSubmitAxios("get", "photos/", {}, {}, { page: currentPage });
      const fetchedPhotos = response.data.data.docs;

      if (fetchedPhotos.length === 0) {
        setHasMore(false); // No more photos to fetch
      } else {
        setPhotos((prev) => [...prev, ...fetchedPhotos]); // Append new photos
      }
    } catch (error) {
      console.log("Error while fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch photos on component mount or page change
  useEffect(() => {
    fetchPhotos(page);
  }, [page]);

  const handleWheelScroll = (e) => {
    const container = document.getElementById("photo-container");
    if (container) {
      container.scrollTop += e.deltaY; // Scroll vertically
  
      const scrollPosition = container.scrollTop + container.offsetHeight; // Current scroll position
      const scrollHeight = container.scrollHeight; // Total scrollable height
  
      // If scrolled to the bottom, fetch the next page
      if (scrollPosition >= scrollHeight - 10 && hasMore && !isLoading) {
        setPage((prev) => prev + 1); // Increment page number
      }
    }
  };
  

  return (
    <div
      id="photo-container"
      className="flex overflow-y-auto relative bg-gray-900 items-center flex-col space-y-4 p-4"
      onWheel={handleWheelScroll}
    >
      {photos.map((photo) => (
    
          <Photo
            key={photo._id}
            photo={photo.url}
            morePhoto={photo.morePhoto}
            fullName={photo.ownerDetails.fullName}
            avatar={photo.ownerDetails.avatar}
            ownerId={photo.ownerDetails._id}
            title={photo.title}
            description={photo.description}
            id={photo._id}
          />
      ))}
      {isLoading && <p className="text-center text-gray-500">Loading...</p>}
    </div>
  );
}

export default PhotoPage;

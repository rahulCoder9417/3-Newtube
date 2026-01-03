import React, { useEffect, useState, useRef, useCallback } from "react";
import Photo from "../components/photo/Photo";
import { onSubmitAxios } from "../utils/axios";

function PhotoPage() {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef();
  const lastPhotoRef = useRef();

  // Fetch photos from API
  const fetchPhotos = async (currentPage) => {
    setIsLoading(true);
    try {
      const response = await onSubmitAxios("get", "photos/", {}, {}, { page: currentPage });
      const fetchedPhotos = response.data.data.docs;

      if (fetchedPhotos.length === 0) {
        setHasMore(false);
      } else {
        setPhotos((prev) => [...prev, ...fetchedPhotos]);
      }
    } catch (error) {
      console.log("Error while fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer callback for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading]);

  // Set up intersection observer
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, option);
    
    if (lastPhotoRef.current) {
      observerRef.current.observe(lastPhotoRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Fetch photos on page change
  useEffect(() => {
    fetchPhotos(page);
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-b mx-auto from-gray-900 via-gray-800 to-gray-900">
   

      {/* Photos Grid/Feed */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6 md:space-y-8 flex items-center flex-col ">
          {photos.map((photo, index) => (
            <div
              key={photo._id}
              ref={index === photos.length - 1 ? lastPhotoRef : null}
              className="animate-fade-in w-full flex justify-center "
            >
              <Photo
                photo={photo.url}
                morePhoto={photo.morePhoto}
                fullName={photo.ownerDetails.fullName}
                avatar={photo.ownerDetails.avatar}
                ownerId={photo.ownerDetails._id}
                title={photo.title}
                description={photo.description}
                id={photo._id}
              />
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 font-medium">Loading photos...</p>
          </div>
        )}

        {/* No More Photos */}
        {!hasMore && photos.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-semibold text-lg">You're all caught up!</p>
              <p className="text-gray-500 text-sm mt-1">No more photos to load</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-400 font-medium text-lg">No photos yet</p>
              <p className="text-gray-600 text-sm mt-1">Be the first to share something!</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default PhotoPage;
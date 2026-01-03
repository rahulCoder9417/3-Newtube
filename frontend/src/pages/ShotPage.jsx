import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { scroller } from "react-scroll";
import ShotPlayer from "../components/shotpage/ShotPlayer";
import { onSubmitAxios } from "../utils/axios";
import { FaArrowUp, FaPlay } from "react-icons/fa";

const ShotPage = () => {
  const containerRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [visibleDiv, setVisibleDiv] = useState(null);
  const [canScrollSmooth, setCanScrollSmooth] = useState(true);
  const [canInteract, setCanInteract] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { a, id: urlId } = useParams();

  // Handle URL parameter redirection
  useEffect(() => {
    if (a && urlId) {
      navigate(`/shot/${urlId}`, { replace: true });
    }
  }, [a, urlId, navigate]);

  // Fetch videos with loading state
  const fetchVideos = useCallback(async (currentPage) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await onSubmitAxios(
        "get",
        "videos/",
        {},
        {},
        { type: "short", page: currentPage }
      );
      const fetchedVideos = response.data.data;

      if (fetchedVideos.length > 0) {
        setVideos((prev) => [...prev, ...fetchedVideos]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // Initial fetch
  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  // Intersection Observer for video visibility and pagination
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = entry.target.id;
            setVisibleDiv(entry.target);
            navigate(`/shot/${videoId}`, { replace: true });

            // Trigger pagination when near end
            const index = videos.findIndex((v) => v._id === videoId);
            if (index >= videos.length - 3 && hasMore && !isLoading) {
              setPage((prev) => prev + 1);
            }
          }
        });
      },
      { threshold: 0.55 }
    );

    const elements = containerRef.current?.querySelectorAll(".scroll-div");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [videos, hasMore, isLoading, navigate]);

  // Handle wheel scrolling with debounce
  const handleWheel = useCallback((e) => {
    if (!canScrollSmooth || !visibleDiv) {
      e.preventDefault();
      return;
    }

    setCanScrollSmooth(false);
    const currentIndex = videos.findIndex((v) => v._id === visibleDiv.id);

    if (e.deltaY > 0) {
      // Scroll down
      const nextIndex = currentIndex + 1;
      if (nextIndex < videos.length) {
        scroller.scrollTo(videos[nextIndex]._id, {
          duration: 1000,
          smooth: true,
          offset: -90,
        });
      }
    } else {
      // Scroll up
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        scroller.scrollTo(videos[prevIndex]._id, {
          duration: 1000,
          smooth: true,
          offset: -90,
        });
      }
    }

    setTimeout(() => setCanScrollSmooth(true), 2500);
  }, [canScrollSmooth, visibleDiv, videos]);

  // Attach wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (canInteract) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    } else {
      container.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
    }

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [canInteract, handleWheel]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-medium">Loading videos...</p>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className="container flex flex-col absolute bg-gray-900 items-center gap-10 overflow-y-scroll hide-scrollbar"
      style={{ scrollBehavior: "smooth" }}
    >
       
      {videos.map((video) => (
        <div className="w-screen flex relative justify-center" key={video._id}>
          {visibleDiv?.id === video._id ? (
            <ShotPlayer
              owner={video.owner}
              canScroll={canInteract}
              setCanScroll={setCanInteract}
              id={video._id}
              tags={video.tags}
              views={video.views}
              createdAt={video.createdAt}
              videoFile={video.videoFile}
              description={video.description}
              title={video.title}
            />
          ) : (
            <div
              id={video._id}
              style={{ backgroundImage: `url(${video.thumbnail})` }}
              className="scroll-div rounded-lg w-[360px] aspect-[9/16] bg-cover bg-center snap-start"
            />
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="text-white text-center my-4">Loading...</div>
      )}
      
      {!hasMore && videos.length > 0 && (
        <div className="text-white text-center my-4">No more videos</div>
      )}
    </div>
  );
};

export default ShotPage;
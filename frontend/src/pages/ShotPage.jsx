import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { scroller } from "react-scroll";
import ShotPlayer from "../components/shotpage/ShotPlayer";
import { onSubmitAxios } from "../utils/axios";

const ShotPage = ({ id = null }) => {
  const containerRef = useRef(null);
  const [video, setVideo] = useState([]);
  const [visibleDiv, setVisibleDiv] = useState(null);
  const [scrol, setScrol] = useState(true);
  const [canScroll, setCanScroll] = useState(true);
  const [page, setPage] = useState(1); // Current page
  const [hasMore, setHasMore] = useState(true); // To stop fetching when no more videos
  let navigate = useNavigate();
  const {a} =useParams()
  if(a){
    const {id} =useParams()
    navigate(`/shot/${id}`)
  }
  // Fetch videos from the API
  const fetchVideos = async (currentPage) => {
    try {
      const response = await onSubmitAxios(
        "get",
        "videos/",
        {},
        {},
        { type: "short", page: currentPage }
      );
      const fetchedVideos = response.data.data;
        console.log(fetchedVideos)
      if (fetchedVideos.length > 0) {
        setVideo((prevVideos) => [...prevVideos, ...fetchedVideos]);
      } else {
        setHasMore(false); // No more videos
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos(page); // Initial fetch
  }, [page]);

  // Intersection Observer to track visibility of divs
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleDiv(entry.target);
            navigate(`/shot/${entry.target.id}`);

            // Fetch more videos when the user scrolls near the 8th video
            const index = video.findIndex((v) => v._id === entry.target.id);
            if (index >= video.length - 3 && hasMore) {
              setPage((prevPage) => prevPage + 1); // Increment page number
            }
          }
        });
      },
      { threshold: 0.55 }
    );

    let elements = containerRef.current.querySelectorAll(".scroll-div");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, [navigate, video, hasMore]);

  const handleWheel = (e) => {
    if (scrol && visibleDiv) {
      setScrol(false);
      let i = video.findIndex((vide) => vide._id === visibleDiv.id);

      if (e.deltaY > 0) {
        // Scroll Down
        const nextDiv = i + 1;
        if (video.length > nextDiv) {
          scroller.scrollTo(video[nextDiv]._id, {
            duration: 1000,
            delay: 0,
            smooth: true,
            offset: -90,
          });
        }
      } else {
        // Scroll Up
        const preDiv = i - 1;
        if (preDiv >= 0) {
          scroller.scrollTo(video[preDiv]._id, {
            duration: 1000,
            delay: 0,
            smooth: true,
            offset: -90,
          });
        }
      }

      setTimeout(() => setScrol(true), 2500);
    } else {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (canScroll) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    } else {
      container.removeEventListener("wheel", handleWheel);
      container.addEventListener("wheel", (e) => e.preventDefault());
    }

    return () => container.removeEventListener("wheel", handleWheel);
  }, [scrol, visibleDiv, canScroll]);

  return (
    <div
      ref={containerRef}
      className="container flex-col flex top-14 absolute bg-gray-900 items-center gap-10 mt-4 overflow-y-scroll hide-scrollbar"
      style={{ scrollBehavior: "smooth" }}
    >
      {video.map((el) => (
        <div className="w-screen flex relative justify-center" key={el._id}>
          {visibleDiv?.id === el._id ? (
            <ShotPlayer
              owner={el.owner}
              CanScroll={canScroll}
              setCanScroll={setCanScroll}
              id={el._id}
              tags={el.tags}
              views={el.views}
              createdAt={el.createdAt}
              videoFile={el.videoFile}
              description={el.description}
              title={el.title}
            />
          ) : (
            <div
              id={el._id}
              style={{ backgroundImage: `url(${el.thumbnail})` }}
              className={`scroll-div rounded-lg w-[360px] aspect-[9/16] bg-cover bg-center snap-start`}
            ></div>
          )}
        </div>
      ))}
      {!hasMore && <div className="text-center my-4">No more videos</div>}
    </div>
  );
};

export default ShotPage;

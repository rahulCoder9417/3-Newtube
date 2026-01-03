import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { onSubmitAxios } from "../../utils/axios.js";
import TweetComponent from "../tweet/TweetComponent.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Custom arrow components
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110 border border-gray-600/50"
  >
    <FaChevronLeft className="text-white" />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110 border border-gray-600/50"
  >
    <FaChevronRight className="text-white" />
  </button>
);

function TweetSlider() {
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchTweets = async () => {
      setIsLoading(true);
      try {
        const response = await onSubmitAxios("get", "tweets/");
        setTweets(response.data.data);
      } catch (error) {
        console.error("Error fetching tweets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTweets();
  }, []);

  const settings = {

    infinite: tweets.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: tweets.length > 1,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    beforeChange: (current, next) => setCurrentSlide(next),
    customPaging: (i) => (
      <div
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i === currentSlide
            ? "bg-blue-500 w-8"
            : "bg-gray-600 hover:bg-gray-500"
        }`}
      ></div>
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading tweets...</p>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-gray-400 text-lg">No tweets available</p>
        <p className="text-gray-600 text-sm">Check back later for trending content</p>
      </div>
    );
  }

  return (
    <div className="relative tweet-slider-container">
      {/* Slide counter */}
      <div className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-300 border border-gray-700">
        {currentSlide + 1} / {tweets.length}
      </div>

      <Slider {...settings}>
        {tweets.map((tweet) => (
          <div key={tweet._id} className="px-2 py-4">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <TweetComponent
                  userId={tweet.owner._id}
                  tweetId={tweet._id}
                  avatar={tweet.owner.avatar}
                  fullName={tweet.owner.fullName}
                  username={tweet.owner.username}
                  content={tweet.content}
                  image={null}
                  doRetweet={false}
                />
              </div>
            </div>
          </div>
        ))}
      </Slider>

     
    </div>
  );
}

export default TweetSlider;
// TweetSlider.js
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { onSubmitAxios } from "../../utils/axios.js";
import TweetComponent from "../tweet/TweetComponent.jsx";

// Slider settings for React Slick
const settings = {
  infinite: true, // Loop continuously
  speed: 10000, // Animation speed
  slidesToShow: 1, // Show one tweet at a time
  slidesToScroll: 1, // Scroll one slide at a time
  autoplay: true, // Enable autoplay
  autoplaySpeed: 0, // Disable interval, scrolls immediately
  cssEase: "linear", // Smooth continuous scrolling
  arrows: false, // Disable navigation arrows
  pauseOnHover: false, // Continue scrolling even on hover
};

function TweetSlider() {
  const [tweeet, setTweeet] = useState([])
  useEffect(() => {
    const op = async () => {
      const response = await onSubmitAxios("get", "tweets/");
      setTweeet(response.data.data)
    };
    op();
  }, []);

  return (
    <div className="bg-gray-900 text-white py-4 max-w-[75%] min-h-16 rounded-md m-auto">
      <Slider {...settings}>
        {tweeet.map((tweet) => (
          <div key={tweet._id} className="px-4">
            <TweetComponent
              userId={tweet.owner._id}
            key={tweet._id}
            tweetId={tweet._id}
            avatar={tweet.owner.avatar}
            fullName={tweet.owner.fullName}
            username={tweet.owner.username}
            content={tweet.content}
            image={null}
            />
          </div>
        ))}
      </Slider> 
    </div>
  );
}

export default TweetSlider;

import React, { useEffect, useState } from "react";
import Topics from "../components/home/Topics";
import TweetSlider from "../components/home/TweetSlider";
import { onSubmitAxios } from "../utils/axios";


const Home = () => {
    const [data, setData] = useState({ ed: [], sc: [] });
useEffect(() => {
  const reponse = async () => {
    const ed = await onSubmitAxios(
      "get",
      "videos/",
      {},
      {},
      { tags: "Education" }
    );
    setData((prev)=>( { ...prev, ed: ed.data.data }));
    const sc = await onSubmitAxios(
      "get",
      "videos/",
      {},
      {},
      { tags: "Comedy" }
    );
    setData((prev)=>( { ...prev, sc: sc.data.data }));
  };
  reponse();
}, []);

  return (
    <div className="bg-gray-800 text-white px-8 py-12">
      {/* Trending tweets */}
      <section className="mb-12 ">
        <h2 className="text-4xl font-bold mb-6 text-blue-400">
          Trending Tweets
        </h2>
        <TweetSlider />
      </section>
      

      {/* Trending Topics */}
      <section className="mb-12 h-16 flex items-center min-w-screen">
        <h2 className="text-4xl font-bold mb-6 text-blue-400">
          Trending Topics
        </h2>
      </section>
      {data.ed.length !== 0 && (
          <>
            <Topics topic="Education" object={data.ed} />

            <Topics topic="Comedy" object={data.sc} />
          </>
        )}
    </div>
  );
};

export default Home;

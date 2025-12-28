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
    <div className="min-h-screen bg-[#0b1220] text-white px-6 py-10">

    {/* ================= Trending Tweets ================= */}
    <section className="mb-16">
      <h2 className="mb-4 text-3xl font-bold text-blue-400">
        Trending Tweets
      </h2>
  
      <div className="rounded-2xl max-w-[60%] mx-auto border border-white/5 bg-[#0f172a] p-6">
        <TweetSlider />
      </div>
    </section>
  
    {/* ================= Trending Topics ================= */}
    <section className="mb-16">
      <h2 className="mb-8 text-3xl font-bold text-blue-400">
        Trending Topics
      </h2>
  
      {data.ed.length !== 0 && (
        <div className="space-y-14">
          {/* Education */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-white/90">
              Education
            </h3>
            <Topics topic="Education" object={data.ed} />
          </div>
  
          {/* Comedy */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-white/90">
              Comedy
            </h3>
            <Topics topic="Comedy" object={data.sc} />
          </div>
        </div>
      )}
    </section>
  
  </div>
  
  );
};

export default Home;

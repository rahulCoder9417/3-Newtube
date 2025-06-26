import React, { useEffect, useState } from 'react';
import { onSubmitAxios } from '../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import PlaylistComp from '../components/playlist/PlaylistComp';
import { useSelector } from 'react-redux';
import Notifier from '../components/uni/Notifier';

function Playlist() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [canModify, setCanModify] = useState(false)
  const [removeHis, setRemoveHis] = useState(false)
  
  const [load, setLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth)
  const userid = userData.id
  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        const response = await onSubmitAxios("get", `playlist/${id}`);
        setData(response.data.data);
        if (response.data.data.owner._id === userid) {
          setCanModify(true)
        }
        setThumb(response.data.data.videos[0]?.thumbnail); // Ensure there is a video to avoid errors
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };
    const historyi = async()=>{
      try {
        const response = await onSubmitAxios("get", `users/history`);
        setData({
          description:'History',
          name:"WatchHistory",
          owner:{fullName:userData.fullName,avatar:userData.avatar,_id:userid},
          videos:response.data.data
        })
        setThumb("https://res.cloudinary.com/dmywuwnwx/image/upload/v1736087537/griymakscenkandpnrfn.png");
      } catch (error) {
        console.log("errror history",error)
      }
    }
    if (id=="watch-history") {
      setRemoveHis(true)
      historyi()
    }else{
      fetchPlaylistData();
    }
  }, [id]);
  const remove = async(id)=>{

    try {
      setVisible(true);
      setLoad(true);
      await onSubmitAxios("get",`users/remove-video-history/${id}`)
      setData({...data,videos:data.videos.filter((i)=>i._id!==id)})
      setLoad(false);
      setMessage("success");
    } catch (error) {
      setLoad(false);
      setMessage("error");
    }
  }

  return (
    <div className="flex flex-col md:flex-row  gap-6 p-6 bg-[#0A1C2E] text-white">
      {visible && (
        <Notifier
          type={message}
          message={
            message === "error" ? "Error in removing video" : " Success in removing"
          }
          loading={load}
          setV={setVisible}
        />
      )}
      {/* Left Section */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Thumbnail */}
        <img
          src={thumb || ""}
          alt="Playlist Thumbnail"
          className="w-full rounded-lg shadow-md"
        />

        {/* Owner and Playlist Details */}
        <div className="flex items-center gap-4">
          <img
            src={data?.owner.avatar}
            alt="Owner Avatar"
            className="w-12 h-12 rounded-full border-2 border-blue-400"
          />
          <div>
            <h4 className="text-lg font-bold">{data?.owner.fullName}</h4>
            <p className="text-gray-400">{data?.name}</p>
          </div>
        </div>

        {/* Playlist Description */}
        <p className="text-gray-300">{data?.description}</p>

        {/* Modify Playlist Button */}
        {canModify && ( <button onClick={()=>navigate(`/playlistManipulation/${id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700">
          Modify Playlist
        </button>)}
       
      </div>

      {/* Right Section */}
      <div className="w-[450px] border border-blue-700 space-y-2 rounded-lg p-4">
        {data?.videos.map((video, index) => (
          <PlaylistComp removeHis={removeHis} remove={remove} dataa={video} id={video._id} pId={id} key={video._id} index={index} />
        ))}
      </div>
    </div>
  );
}

export default Playlist;

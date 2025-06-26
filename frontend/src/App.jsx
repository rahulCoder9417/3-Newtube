import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./pages/User";
import NavBar from "./components/uni/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserUpdate from "./pages/UserUpdate";
import VideoPage from "./pages/VideoPage";
import ShotPage from "./pages/ShotPage";
import Test from "./pages/Test";
import PhotoPage from "./pages/PhotoPage";
import Playlist from "./pages/Playlist";
import Uploading from "./pages/Uploading";
import Updation from "./pages/Updation";
import Manipulation from "./pages/Manipulation";
import TweetPage from "./pages/TweetPage";
import Tweets from "./pages/Tweets";
import Dashboard from "./pages/Dashboard";
import Youtube from "./pages/Youtube";
import PlaylistMani from "./pages/PlaylistMani";
function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<User />} />
        <Route path="/test" element={<Test />} />
        <Route path="/test/:id" element={<Test />} />
        <Route path="/user-updation" element={<UserUpdate />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/videos" element={<Youtube />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/playlistManipulation/:id" element={<PlaylistMani />} />
        <Route path="/uploading" element={<Uploading />} />
        <Route path="/update" element={<Updation />} />
        <Route path="/tweets" element={<TweetPage />} />
        <Route path="/tweet/:id" element={<Tweets />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/manipulate/:id" element={<Manipulation />} />
        <Route path="/shot/:id" element={<ShotPage />} />
        <Route path="/shot" element={<ShotPage />} />
        <Route path="/shot/:id/:a" element={<ShotPage />} />
        <Route path="/discover/" element={<PhotoPage />} />
        <Route path="/discover/:id" element={<PhotoPage />} />
      </Routes>
    </Router>
  );
}

export default App;

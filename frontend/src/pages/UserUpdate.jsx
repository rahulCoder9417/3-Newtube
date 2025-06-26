import React, { useState } from 'react';
import { onSubmitAxios } from '../utils/axios';
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";

const UserUpdate = () => {
  const dispatch = useDispatch();
  const [updateType, setUpdateType] = useState("username");
  const [fetchState, setFetchState] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    avatar: null,
    coverImage: null,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        requestData.append(key, formData[key]);
      }
    }

    let type, url;
    switch (updateType) {
      case "username":
        type = "patch";
        url = "users/update-account";
        break;
      case "avatar":
        type = "patch";
        url = "users/avatar";
        break;
      case "coverImage":
        type = "patch";
        url = "users/cover-image";
        break;
      case "password":
        if (formData.newPassword !== formData.confirmPassword) {
          console.log("Passwords do not match");
          return;
        }
        type = "post";
        url = "users/change-password";
        break;
      default:
        break;
    }

    try {
      setFetchState("doing");
      const response = await onSubmitAxios(type, url, requestData);
      dispatch(
        login({
          username: response?.data.data.username,
          fullname: response?.data.data.fullname,
          avatar: response?.data.data.avatar,
          isAuthenticated: true,
        })
      );
      console.log("Updated " + updateType, response);
      setFetchState("");
    } catch (error) {
      setFetchState("error");
      console.error("Error updating user: ", error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen w-full">
    <div className="user-update max-w-xl mx-auto p-6 border border-gray-700 rounded-lg shadow-lg bg-gray-800 text-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">
        Update Your Profile
      </h2>

      <div className="mb-6">
        <label
          htmlFor="updateType"
          className="block text-sm font-semibold mb-2"
        >
          What would you like to update?
        </label>
        <select
          id="updateType"
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={updateType}
          onChange={(e) => {
            setUpdateType(e.target.value);
            setFormData({
              username: "",
              fullName: "",
              avatar: null,
              coverImage: null,
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }}
        >
          <option value="username">Username & Full Name</option>
          <option value="avatar">Avatar</option>
          <option value="coverImage">Cover Image</option>
          <option value="password">Password</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {updateType === "username" && (
          <>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>
          </>
        )}

        {updateType === "avatar" && (
          <div>
            <label htmlFor="avatar" className="block text-sm font-semibold mb-2">
              Upload New Avatar
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleFileChange}
            />
          </div>
        )}

        {updateType === "coverImage" && (
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-semibold mb-2"
            >
              Upload New Cover Image
            </label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleFileChange}
            />
          </div>
        )}

        {updateType === "password" && (
          <>
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-semibold mb-2"
              >
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.oldPassword}
                onChange={handleInputChange}
                placeholder="Enter your old password"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold mb-2"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition font-semibold"
        >
          Update
        </button>

        <div className="mt-4">
          {fetchState === "doing" && (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Updating...</span>
            </div>
          )}
          {fetchState === "error" && (
            <p className="text-red-500">Error updating user. Please try again.</p>
          )}
        </div>
      </form>
    </div></div>
  );
};

export default UserUpdate;

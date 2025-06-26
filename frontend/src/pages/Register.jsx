import React from "react";
import { useForm } from "react-hook-form";
import { onSubmitAxios } from "../utils/axios.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Register = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [fetchState, setFetchState] = useState("null");
  const navigate = useNavigate(); // Initialize navigate

  const onSubmit = async (data) => {
    try {
      setFetchState("doing");
      if (data.avatar[0].name === data.coverImage[0].name) {
        setFetchState("same");
      }

      const formData = new FormData();
      formData.append("fullName", data.fullname);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("username", data.username);
      formData.append("avatar", data.avatar[0]);
      formData.append("coverImage", data.coverImage[0]);

      const response = await onSubmitAxios("post", "users/register", formData, {
        "Content-Type": "multipart/form-data",
      });

      setFetchState("done");
      navigate("/login"); // Redirect to login page on success
    } catch (error) {
      console.error("Error registering user:", error);
      setFetchState(error.response?.status === 409 ? "conflict" : "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-blue-300"
            >
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              {...register("fullname", { required: "Full Name is required" })}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.fullname && (
              <p className="text-sm text-red-500 mt-1">{errors.fullname.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-blue-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-blue-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-blue-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username", { required: "Username is required" })}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-blue-300"
            >
              Avatar
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              {...register("avatar", { required: "Avatar is required" })}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.avatar && (
              <p className="text-sm text-red-500 mt-1">{errors.avatar.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-blue-300"
            >
              Cover Image
            </label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              {...register("coverImage", { required: "Cover Image is required" })}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.coverImage && (
              <p className="text-sm text-red-500 mt-1">{errors.coverImage.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register
          </button>
          <div className="mt-4">
            {fetchState === "doing" && (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-300">Registering...</span>
              </div>
            )}
            {fetchState === "conflict" && (
              <p className="text-yellow-500 text-center">Username or email is already in use. Please try a different one.</p>
            )}
            {fetchState === "error" && (
              <p className="text-red-500 text-center">Error registering user. Please try again.</p>
            )}
            {fetchState === "same" && (
              <p className="text-red-500 text-center">Use different avatar and cover image</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { registerSchema } from "../utils/schema";
import { onSubmitAxios } from "../utils/axios";
import { login } from "../store/authSlice";
import FilePicker from "../components/forms/FilePicker";
import { uploadToCloudinary } from "../utils/cloudinary";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchState, setFetchState] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setFetchState("doing");

      if (data.avatar[0].name === data.coverImage[0].name) {
        setFetchState("same");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", data.fullname);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("username", data.username);
      const avatarResponse = await uploadToCloudinary(data.avatar[0], "image");
      formData.append("avatar", avatarResponse.secure_url);
      const coverImageResponse = await uploadToCloudinary(data.coverImage[0], "image");
      formData.append("coverImage", coverImageResponse.secure_url);

      const response = await onSubmitAxios(
        "post",
        "users/register",
        formData,
        { "Content-Type": "multipart/form-data" }
      );

      dispatch(
        login({
          username: response.data.data.username,
          fullName: response.data.data.fullName,
          id: response.data.data._id,
          avatar: response.data.data.avatar,
          isAuthenticated: true,
        })
      );

      setFetchState("done");
      navigate("/home");
    } catch (error) {
      setFetchState(error.response?.status === 409 ? "conflict" : "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-400 text-center mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "fullname", label: "Full Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" },
            { name: "username", label: "Username", type: "text" },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="text-blue-300 text-sm">{label}</label>
              <input
                type={type}
                {...register(name)}
                className="w-full mt-1 bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2"
              />
              {errors[name] && (
                <p className="text-red-500 text-sm">
                  {errors[name].message}
                </p>
              )}
            </div>
          ))}

<FilePicker
  label="Avatar"
  name="avatar"
  register={register}
  error={errors.avatar}
/>

<FilePicker
  label="Cover Image"
  name="coverImage"
  register={register}
  error={errors.coverImage}
/>


          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
          >
            Register
          </button>
        </form>

        <div className="mt-4 text-center">
          {fetchState === "doing" && <p className="text-blue-300">Registering…</p>}
          {fetchState === "conflict" && (
            <p className="text-yellow-400">Email or username already exists</p>
          )}
          {fetchState === "same" && (
            <p className="text-red-400">
              Avatar and cover image must be different
            </p>
          )}
          {fetchState === "error" && (
            <p className="text-red-500">Registration failed</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;

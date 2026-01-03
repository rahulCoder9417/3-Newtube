import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { onSubmitAxios } from "../utils/axios";
import { login } from "../store/authSlice";
import { loginSchema } from "../utils/schema";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await onSubmitAxios("post", "users/login", data);

      dispatch(
        login({
          username: response.data.data.user.username,
          fullName: response.data.data.user.fullName,
          id: response.data.data.user._id,
          avatar: response.data.data.user.avatar,
          isAuthenticated: true,
        })
      );

      navigate("/home");
    } catch (error) {
      alert(
        error.response?.status === 409
          ? "Incorrect email or password"
          : error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-start pt-20 justify-center bg-gray-900">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-300">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 block w-full bg-gray-700 text-gray-200 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-300">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

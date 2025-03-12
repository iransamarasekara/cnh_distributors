import React from "react";
import LoginForm from "../components/LoginForm";
import { login_background } from "../assets";

const LoginPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="m-auto w-full max-w-5xl flex overflow-hidden gap-6">
        <div className="w-full md:w-2/5 p-8 flex flex-col justify-center border-3 border-gray-200 rounded-3xl text-center">
          <h1 className="text-3xl font-semibold text-blue-400 mb-1">
            C&H DISTRIBUTORS
          </h1>
          <p className="text-gray-600 mb-20">Inventory Management System</p>
          <LoginForm />
        </div>
        <div className="hidden md:block md:w-3/5">
          <img
            src={login_background}
            alt="Inventory Management Illustration"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

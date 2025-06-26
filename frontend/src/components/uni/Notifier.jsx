import React, { useEffect } from "react";
import { FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

const Notifier = ({ type, message, setV, loading }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setV(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, [setV]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 p-4 rounded-3xl flex gap-2 text-center w-80 shadow-lg">
        {loading && (
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!loading && (
          <div className="flex gap-5 items-center mb-4">
            {type === "error" ? (
              <FaExclamationCircle className="text-red-500 text-4xl mb-2" />
            ) : (
              <FaCheckCircle className="text-blue-500 text-4xl mb-2" />
            )}
            <h3 className={`text-lg font-semibold ${type === "error" ? "text-red-500" : "text-blue-500"}`}>
              {message}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifier;

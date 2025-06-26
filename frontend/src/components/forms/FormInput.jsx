import React from "react";

const FormInput = ({ label, id, type = "text", register, errors, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`mt-1 block w-full rounded-md border ${
          errors[id]
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-indigo-500"
        } shadow-sm sm:text-sm`}
        {...register} // Fix: Spread the register object here
        {...props}
      />
      {errors[id] && (
        <p className="mt-1 text-sm text-red-500">{errors[id].message}</p>
      )}
    </div>
  );
};

export default FormInput;

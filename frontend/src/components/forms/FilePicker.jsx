import { useState } from "react";

const FilePicker = ({ label, register, name, error }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-2">
      <label className="text-blue-300 text-sm">{label}</label>

      <label
        htmlFor={name}
        className="flex flex-col items-center justify-center w-full h-40
                   border-2 border-dashed border-gray-600 rounded-lg
                   cursor-pointer bg-gray-700 hover:bg-gray-600 transition"
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center text-gray-300">
            <p className="font-medium">Click to upload</p>
            <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
          </div>
        )}

        <input
          id={name}
          type="file"
          accept="image/*"
          hidden
          {...register(name, {
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFileName(file.name);
                setPreview(URL.createObjectURL(file));
              }
            },
          })}
        />
      </label>

      {fileName && (
        <p className="text-xs text-gray-400 truncate">
          Selected: {fileName}
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default FilePicker;

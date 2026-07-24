import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  Image,
  CheckCircle2,
} from "lucide-react";

interface UploadBoxProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

export default function UploadBox({
  selectedFile,
  setSelectedFile,
}: UploadBoxProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    [setSelectedFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    onDrop,
  });

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full">

      <div className="flex items-center gap-2 mb-2">

        <UploadCloud
          className="text-indigo-600"
          size={22}
        />

        <h2 className="text-lg font-bold">
          Upload Notes
        </h2>

      </div>

      <p className="text-sm text-gray-500 mb-4">
        PDF, JPG or PNG
      </p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition

        ${
          isDragActive
            ? "border-indigo-600 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-500"
        }`}
      >
        <input {...getInputProps()} />

        <UploadCloud
          className="mx-auto text-indigo-600"
          size={40}
        />

        <p className="mt-3 font-medium">
          Drag & Drop
        </p>

        <p className="text-xs text-gray-500 mt-1">
          or click to browse
        </p>
      </div>

      {selectedFile && (
        <div className="mt-5 rounded-xl bg-green-50 border border-green-200 p-3">

          <div className="flex items-center gap-3">

            {selectedFile.type.includes("pdf") ? (
              <FileText
                className="text-red-500"
                size={22}
              />
            ) : (
              <Image
                className="text-blue-500"
                size={22}
              />
            )}

            <div className="flex-1">

              <p className="font-medium text-sm truncate">
                {selectedFile.name}
              </p>

              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>

            </div>

            <CheckCircle2
              className="text-green-600"
              size={22}
            />

          </div>

        </div>
      )}
    </div>
  );
}
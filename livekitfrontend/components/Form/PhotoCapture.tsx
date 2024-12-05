/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRef } from "react";
import { useCamera } from "./hooks/useCamera";
import { MdCameraAlt } from "react-icons/md";


interface PhotoCaptureProps {
  photo: string | null;
  onPhotoCapture: (photo: string) => void;
  onRetake: () => void;
}

export function PhotoCapture({
  photo,
  onPhotoCapture,
  onRetake,
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, showCamera, startCamera, stopCamera } = useCamera(videoRef);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photo = canvas.toDataURL("image/jpeg");
        onPhotoCapture(photo);
        stopCamera();
      }
    }
  };

  if (photo) {
    return (
      <div className="space-y-3">
        <img
          src={photo}
          alt="Captured photo"
          className="w-full h-[300px] object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRetake}
          className=" end-test-button w-full text-white py-2 px-4 rounded-lg font-medium
                      focus:outline-none focus:ring-2  
                     focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 focus:ring-orange-500"
        >
          Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showCamera ? (
        <button
          type="button"
          onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 py-2 px-4
                   bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium
                   text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                   transition-colors duration-200 focus:ring-orange-500"
        >
          <MdCameraAlt className="w-5 h-5" />
          Open Camera
        </button>
      ) : (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[300px] object-cover rounded-lg bg-gray-100"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className=" end-test-button w-full text-white py-2 px-4 rounded-lg font-medium
                      focus:outline-none focus:ring-2  
                     focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 focus:ring-orange-500"
            >
              Take Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm
                       font-medium text-gray-700 hover:bg-gray-50 focus:outline-none
                       focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
                       transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { MdCameraAlt } from "react-icons/md";


export function CameraCapture({
  onPhotoCapture,
}: {
  onPhotoCapture: (photo: string) => void;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Unable to access camera. Please ensure you have granted camera permissions."
      );
    }
  };

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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setShowCamera(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!showCamera ? (
        <button onClick={startCamera} className="flex items-center gap-2">
          <MdCameraAlt className="w-4 h-4" />
          Open Camera
        </button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="rounded-lg max-w-sm w-full h-[300px] object-cover bg-muted"
          />
          <div className="flex gap-2 mt-4 justify-center">
            <button onClick={capturePhoto}>Take Photo</button>
            <button onClick={stopCamera}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

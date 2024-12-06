"use client";

import { SetStateAction, useState } from "react";
import { CameraCapture } from "./CameraCapture";
import Image from "next/image";

export function UserForm() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      name,
      photo,
    });
  };

  return (
    <div className="w-full max-w-md">
      <div>
        <h1 className="text-center">Welcome!</h1>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            {photo ? (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={photo}
                  alt="Captured"
                  className="rounded-lg max-w-sm w-full"
                />
                <button onClick={() => setPhoto(null)}>Retake Photo</button>
              </div>
            ) : (
              <CameraCapture onPhotoCapture={setPhoto} />
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e: { target: { value: SetStateAction<string> } }) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          <button type="submit" className="w-full" disabled={!photo || !name}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

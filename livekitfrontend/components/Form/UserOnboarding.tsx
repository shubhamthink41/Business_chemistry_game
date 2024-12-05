"use client";

import { useState } from "react";
import { UserNameInput } from "./UserNameInput";
import { PhotoCapture } from "./PhotoCapture";

export function UserOnboarding() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, photo });
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Business Chemistry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <PhotoCapture
              photo={photo}
              onPhotoCapture={setPhoto}
              onRetake={() => setPhoto(null)}
            />

            <UserNameInput
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            // disabled={!photo || !name}
            disabled={!name}
            className=" end-test-button w-full text-white py-2 px-4 rounded-lg font-medium
                      focus:outline-none focus:ring-2  
                     focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 focus:ring-orange-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

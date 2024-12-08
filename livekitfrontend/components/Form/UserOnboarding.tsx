/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { UserNameInput } from "./UserNameInput";
import { PhotoCapture } from "./PhotoCapture";
import { useRouter } from "next/navigation";

export function UserOnboarding() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", name);
    if (photo) {
      formData.append("image", photo);
    }

    try {
      console.log(formData);

      const response = await fetch("http://127.0.0.1:5000/api/getStarted", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        router.push("/assessment");
        console.log(data);
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to submit data:",
          response.status,
          errorData.message
        );
        console.error("error:", response.status, errorData.message);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
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

"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoadingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Loading />
    </Suspense>
  );
}

const Loading = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "Unknown";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/results?category=${category}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, category]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div>
      <p className="loading-text">
        Please wait, while your results are being calculated!!
      </p>
      </div>
      <style jsx>{`
        
        .loading-spinner {
          border: 8px solid #f3f4f6;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .loading-text {
          margin-top: 20px;
          font-size: 18px;
          color: #f16e00;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

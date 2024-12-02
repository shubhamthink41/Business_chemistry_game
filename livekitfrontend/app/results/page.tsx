"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useSearchParams } from "next/navigation";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";


const ResultsPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti for 5 seconds
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <div className="results-container">
      {/* Confetti effect */}
      {showConfetti && <Confetti width={width} height={height} />}

      {/* Results content */}
      <div className="results-content">
        <h1>Congratulations!</h1>
        <div style={{ fontSize: "24px", fontWeight: "bold", overflow: "hidden" }}>
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <p>Your business chemistry type is:</p>
                <h2 className="category-title">{category}</h2> 
              </motion.div>
    </div>
                 
        
    
     </div>


      <style jsx>{`
      
        .results-content {
          text-align: center;
          background: rgba(255, 255, 255, 0.85);
  border: 5px solid #f16e00;
  border-radius: 20px;    
        padding: 30px 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 36px;
          color: #4caf50;
          margin-bottom: 10px;
        }
        h2.category-title {
          font-size: 28px;
          color: #ff5722;
          margin-top: 10px;
          font-weight: bold;
        }
        p {
          font-size: 20px;
          color: #333333;
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;

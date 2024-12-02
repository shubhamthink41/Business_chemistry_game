"use-client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  Tooltip,
  Legend,
  LineElement,
  Filler,
  ChartOptions,
} from "chart.js";
import { Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, Tooltip, Legend, LineElement, Filler);

interface Averages {
  pioneer: number;
  driver: number;
  integrator: number;
  guardian: number;
}

interface RadarChartProps {
  averages: Averages;
}

const RadarChart: React.FC<RadarChartProps> = ({ averages }) => {
  const [displayedAverages, setDisplayedAverages] = useState<Averages>({
    pioneer: 0,
    driver: 0,
    integrator: 0,
    guardian: 0,
  });

  const [gradient, setGradient] = useState<string | CanvasGradient | null>(null);

  useEffect(() => {
    // Debugging: Log the incoming averages
    console.log("Incoming averages:", averages);

    // Update displayed averages only if all new averages are not zero
    const totalNewAverages = Object.values(averages).reduce((acc, avg) => acc + avg, 0);
    if (totalNewAverages > 0) {
      setDisplayedAverages(averages);
    }
  }, [averages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const regionGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

        regionGradient.addColorStop(0, "rgba(255, 136, 131, 0.5)");
        regionGradient.addColorStop(0.3, "rgba(255, 191, 136, 0.5)");
        regionGradient.addColorStop(0.5, "rgba(136, 255, 176, 0.5)");
        regionGradient.addColorStop(0.8, "rgba(128, 192, 255, 0.5)");
        regionGradient.addColorStop(1, "rgba(255, 136, 131, 0.5)");
        regionGradient.addColorStop(0.6, "rgba(255, 116, 181, 0.5)");


        setGradient(regionGradient);
      } else {
        console.warn("Canvas context could not be initialized.");
      }
    }
  }, [displayedAverages]);

  const data = {
    labels: ["Witty Wizard",
      "Network Ninja",
      "Chaos Coordinator",
      "Deadline Daredevil",
      "Spreadsheet Sage"],
    datasets: [
      {
        label: "Your Scores",
        data: [
          displayedAverages.pioneer || 0,
          displayedAverages.driver || 0,
          displayedAverages.integrator || 0,
          displayedAverages.guardian || 0,
        ],
        backgroundColor: gradient || "rgba(0, 0, 0, 0.2)", // Fallback color if gradient fails
        borderColor: "black",
        borderWidth: 2,
        pointBackgroundColor: [
          "rgba(255, 255, 0, 1)",
          "rgba(0, 128, 255, 1)",
          "rgba(255, 0, 0, 1)",
          "rgba(0, 255, 0, 1)",
          "rgba(1,255,0,128,1)"
        ],
        pointBorderColor: "black",
        pointRadius: 6,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        type: "radialLinear",
        angleLines: { display: true, color: "black" },
        suggestedMin: 0,
        suggestedMax: 5,
        grid: {
          color: "black",
        },
        ticks: {
          stepSize: 1,
          color: "#333",
          display: false,
        },
        pointLabels: {
          color: "#333",
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#333",
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ position: "relative", width: "100%", height: "500px" }}>
      <Radar data={data} options={options} />
      {/* Debugging: Display current displayed averages */}
      
    </div>
  );
};

export default RadarChart;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiveKitRoom } from "@livekit/components-react";
import { BarVisualizer } from "@livekit/components-react";
import { RoomAudioRenderer } from "@livekit/components-react";
import { VoiceAssistantControlBar } from "@livekit/components-react";
import { useVoiceAssistant } from "@livekit/components-react";
import { DisconnectButton } from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import RadarChart from "@/app/RadarChart";
import type { AgentState } from "@livekit/components-react";
import { useRouter } from "next/navigation";
// import TranscriptionHandler from "";

interface TranscriptResponse {
  results: {
    question: string;
    answer: string;
    scores: {
      pioneer: number;
      driver: number;
      integrator: number;
      guardian: number;
    };
  }[];
}

interface ConnectionDetails {
  participantToken: string;
  serverUrl: string;
}

export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [roomId, setRoomId] = useState<string>("");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const [scores, setScores] = useState({
    pioneer: 0,
    driver: 0,
    integrator: 0,
    guardian: 0,
  });

  const [scoreCounts, setScoreCounts] = useState({
    pioneer: 0,
    driver: 0,
    integrator: 0,
    guardian: 0,
  });

  const [averages, setAverages] = useState({
    pioneer: 0,
    driver: 0,
    integrator: 0,
    guardian: 0,
  });

//   const [jsonResult, setJsonResult] = useState<string[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

//   useEffect(() => {
//     const checkLocalStorage = () => {
//       const questionLog = localStorage.getItem("questionLog");
//       if (questionLog) {
//         const index = parseInt(questionLog);
//         setCurrentQuestionIndex(index);
//       }
//     };

//     checkLocalStorage();

//     const interval = setInterval(checkLocalStorage, 100);

//     return () => clearInterval(interval);
//   }, []);

  const fetchTranscript = async (sessionId: string) => {
    try {
      const analyzeResponse = await fetch(
        "http://localhost:5000/api/analyze_transcripts/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: sessionId }),
        }
      );

      if (!analyzeResponse.ok) throw new Error("Analyze API error");

      const data: TranscriptResponse = await analyzeResponse.json();
      console.log("Full response data:", data);

      if (!Array.isArray(data.results)) {
        console.error(
          "Expected 'results' to be an array, but got:",
          data.results
        );
        return;
      }

      const updatedScores = { ...scores };
      const updatedCounts = { ...scoreCounts };

      data.results.forEach(({ scores: resultScores }) => {
        if (resultScores) {
          Object.keys(resultScores).forEach((key) => {
            updatedScores[key as keyof typeof updatedScores] +=
              resultScores[key as keyof typeof resultScores];
            updatedCounts[key as keyof typeof updatedCounts] += 1;
          });
        }
      });

      setScores(updatedScores);
      setScoreCounts(updatedCounts);
    } catch (error) {
      console.error("Error fetching transcript or processing data:", error);
    }
  };

  const calculateAverages = () => {
    const totalScores = Object.values(scores).reduce(
      (acc, score) => acc + score,
      0
    );

    if (totalScores === 0) {
      return { ...averages };
    }

    return {
      pioneer: scores.pioneer / (scoreCounts.pioneer || 1),
      driver: scores.driver / (scoreCounts.driver || 1),
      integrator: scores.integrator / (scoreCounts.integrator || 1),
      guardian: scores.guardian / (scoreCounts.guardian || 1),
    };
  };

  const stopPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setPollingInterval(null);
  };

  const shutdownSession = async (roomId: string) => {
    stopPolling();
    await fetch(`/api/session/${roomId}/shutdown/`, { method: "POST" });
  };

  const onConnectButtonClicked = useCallback(async () => {
    const response = await fetch("/api/connection-details");
    const connectionDetails = await response.json();

    // const parsedResult = JSON.parse(connectionDetails.dynamicContent);
    // setJsonResult(parsedResult);

    // console.log("parsedResult - ", parsedResult);

    updateConnectionDetails(connectionDetails);
    setRoomId(connectionDetails?.roomId);

    const interval = setInterval(() => {
      fetchTranscript(connectionDetails?.roomId);
    }, 3000);
    setPollingInterval(interval);
  }, []);

  useEffect(() => {
    if (scores && scoreCounts) {
      const newAverages = calculateAverages();
      setAverages(newAverages);
    }
  }, [scores, scoreCounts]);

  return (
    <main className="page-container">
      <div className="room-container">
        <div >  
          {/* {jsonResult.length > 0 && currentQuestionIndex > 0 ? (
            <p className="current-question">
              {jsonResult[currentQuestionIndex - 1]}
            </p>
          ) : (
            <p>Hello</p>
          )} */}
          <LiveKitRoom
            token={connectionDetails?.participantToken}
            serverUrl={connectionDetails?.serverUrl}
            connect={Boolean(connectionDetails)}
            audio={true}
            video={false}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={() => {
              stopPolling();
              updateConnectionDetails(undefined);
            }}
            className="w-full h-full flex flex-col justify-center items-center"
          >
            <SimpleVoiceAssistant onStateChange={setAgentState} />
            <AnimatePresence>
              {agentState === "disconnected" && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="connect-btn"
                  onClick={onConnectButtonClicked}
                >
                  Start a conversation
                </motion.button>
              )}
            </AnimatePresence>

            <ControlBar
              onConnectButtonClicked={onConnectButtonClicked}
              agentState={agentState}
              roomId={roomId}
              onShutdown={shutdownSession}
              averages={averages}
            />

            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>

        {/* <div className="right-section">
          <RadarChart averages={averages} />
        </div> */}
      </div>
    </main>
  );
}

function SimpleVoiceAssistant({
  onStateChange,
}: {
  onStateChange: (state: AgentState) => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => onStateChange(state), [state]);

  return (
    <BarVisualizer
      state={state}
      barCount={5}
      trackRef={audioTrack}
      className="visualizer"
    />
  );
}

function ControlBar({
  onConnectButtonClicked,
  agentState,
  roomId,
  onShutdown,
  averages,
}: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
  roomId: string;
  onShutdown: (roomId: string) => Promise<void>;
  averages: { [key: string]: number };
}) {
  const router = useRouter();

  const handleDisconnect = async () => {
    if (roomId) {
      await onShutdown(roomId);
    }

    const getHighestScoringCategory = () => {
      const entries = Object.entries(averages);
      const [category] = entries.reduce((max, curr) =>
        curr[1] > max[1] ? curr : max
      );
      return category;
    };

    const highestCategory = getHighestScoringCategory();
    console.log("Highest-scoring category:", highestCategory);
    localStorage.clear();

    router.push(`/loading?category=${highestCategory}`);
  };

  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton
              onClick={handleDisconnect}
              className="connect-btn"
            >
              END CONVERSATION
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
      {/* <TranscriptionHandler /> */}
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert("Permission error. Please reload.");
}

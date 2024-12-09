/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  DisconnectButton,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { useRouter } from "next/navigation";
import type { AgentState } from "@livekit/components-react";


interface TranscriptResponse {
  finalcategory: string;
}

interface ConnectionDetails {
  participantToken: string;
  serverUrl: string;
}

export default function Page() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [roomId, setRoomId] = useState<string>("");
  const [finalCategory, setFinalCategory] = useState<string | null>(null);
  const [showZoomImage, setShowZoomImage] = useState<boolean>(false);
  const router = useRouter();

  const fetchFinalCategory = async (roomId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/analyze_transcripts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });

    if (!response.ok) {
      console.error("Error fetching final category:", response.statusText);
      return null;
    }

    const data = await response.json();
    const finalCategory = JSON.parse(data.final_analysis)?.finalcategory;
    return finalCategory || null;
  };

  const shutdownSession = async (roomId: string) => {
    await fetch(`/api/session/${roomId}/shutdown/`, { method: "POST" });
  };

  const onConnectButtonClicked = useCallback(async () => {
    const response = await fetch("/api/connection-details");
    const connectionDetails = await response.json();

    setConnectionDetails(connectionDetails);
    setRoomId(connectionDetails.roomId);
  }, []);

  useEffect(() => {
    return () => {
      if (roomId) {
        shutdownSession(roomId);
      }
    };
  }, [roomId]);

  const handleDisconnect = async () => {
    if (roomId) {
      await shutdownSession(roomId);
      const category = await fetchFinalCategory(roomId);

      if (category) {
        setFinalCategory(category);
        setShowZoomImage(true); // Trigger the zoom animation
      } else {
        console.error("No final category received.");
        alert("Error: Unable to fetch results. Please try again.");
      }
    }
  };

  const handleAnimationEnd = () => {
    if (finalCategory) {
      localStorage.clear(); // Clear session data
      router.push(`/results?category=${finalCategory}`);
    }
  };

  const renderZoomImage = () => {
    if (!finalCategory) return null;
  
    const images = {
      "Network Ninja": "/images/card1.svg",
      "Witty Wizard": "/images/card2.svg",
      "Chaos Coordinator": "/images/card3.svg",
      "Deadline Daredevil": "/images/card4.svg",
    } as const; // Use 'as const' for a readonly type
  
    // Narrow the type of finalCategory to match the keys of images
    const imageSrc = images[finalCategory as keyof typeof images] || "";
  
    return (
      <motion.div
        className="zoom-image"
        initial={{
          scale: 0.5, // Start smaller
          opacity: 0, // Start invisible (dark)
          y: "-100%", // Start from above the screen
        }}
        animate={{
          scale: 1, // Enlarge the image to fit the center
          opacity: 1, // Fade in (brighten)
          y: 0, // Center vertically
        }}
        exit={{
          scale: 0,
          opacity: 0,
        }}
        transition={{
          duration: 2, // The image will take 2 seconds to enlarge and fade in
          ease: [0.42, 0, 0.58, 1], // Smooth easing for the animation
        }}
        onAnimationComplete={handleAnimationEnd}
      >
        <img src={imageSrc} alt={finalCategory} className="zoom-card-image" />
      </motion.div>
    );
  };
  
 
  
  return (
    <main className="page-container">
      <h1 className="title">ALCHEMISTS OF VEGAS</h1>

      {showZoomImage ? (
        renderZoomImage()
      ) : (
        <div className="image-container">
          <div className="image-box yellow-light">
            <img src="/images/card1.svg" alt="Image 1" />
          </div>
          <div className="image-box blue-light">
            <img src="/images/card2.svg" alt="Image 2" />
          </div>
          <div className="image-box orange-light">
            <img src="/images/card3.svg" alt="Image 3" />
          </div>
          <div className="image-box red-light">
            <img src="/images/card4.svg" alt="Image 4" />
          </div>
        </div>
      )}

      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={Boolean(connectionDetails)}
        audio
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => {
          setConnectionDetails(undefined);
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
          handleDisconnect={handleDisconnect}
        />

        <RoomAudioRenderer />
      </LiveKitRoom>
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
  handleDisconnect,
}: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
  roomId: string;
  onShutdown: (roomId: string) => Promise<void>;
  handleDisconnect: () => Promise<void>;
}) {
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
            <DisconnectButton onClick={handleDisconnect} className="connect-btn">
              END CONVERSATION
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert("Permission error. Please reload.");
}

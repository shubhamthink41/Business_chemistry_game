/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useMaybeRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import "@livekit/components-styles";

const TranscriptionHandler = () => {
  const room = useMaybeRoomContext();
  const [fullTranscription, setFullTranscription] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [log, setLog] = useState(() => {
    return parseInt(localStorage.getItem('questionLog') || '0');
  });
  const [hasMatched, setHasMatched] = useState(false); // Flag to track if a match has occurred


  const checkQuestionType = (input) => {
    const lowercasedInput = input.toLowerCase();

    // Keywords to match
    const nextQuestionKeywords = [
      "your next question is",
      "your question is",
      "your first question is",
      "here is your first question",
      "lets move to the next question",
      "here is your next question",
    ];
    const lastQuestionKeywords = [
      "your question is",
      "your last question is",
      "your next question is",
      "here is your final question",
    ];

    const isNext = nextQuestionKeywords.some((keyword) =>
      lowercasedInput.includes(keyword)
    );
    const isLast = lastQuestionKeywords.some((keyword) =>
      lowercasedInput.includes(keyword)
    );

    // Increment log only if there's a match and it hasn't been matched before
    if ((isNext || isLast) && !hasMatched) {
      setLog((prevLog) => {
        const newLog = prevLog < 5 ? prevLog + 1 : prevLog;
        localStorage.setItem('questionLog', newLog.toString());
        return newLog;
      });
      setHasMatched(true); // Set the flag to true after matching
    } else if (!(isNext || isLast)) {
      setHasMatched(false); // Reset the flag if no match
    }
  };

  useEffect(() => {
    if (!room) return;

    const updateTranscriptions = (segments) => {
      const formattedText = segments.map((segment) => segment.text).join(" ");
      setFullTranscription((prev) => prev + " " + formattedText);

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      setTypingTimeout(
        setTimeout(() => {
          checkQuestionType(fullTranscription + " " + formattedText);
          setFullTranscription("");
        }, 500)
      );
    };

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);

    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [room, typingTimeout, fullTranscription]);

  return null;
};

export default TranscriptionHandler;

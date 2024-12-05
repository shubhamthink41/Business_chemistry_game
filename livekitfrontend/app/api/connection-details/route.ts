import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
interface TokenResponse {
  token: string;
  room_name: string;
  metadata: object;
}

const questions: string[] = [
  "You're stuck in a Las Vegas elevator with Elon Musk and a stand-up comedian. How do you keep everyone entertained for the next 5 min?",
  "You've been given a free round-the-world ticket, but you can only choose three completely unrelated activities in 3 different cities. What would they be?",
  "You are in MasterChef USA and you have been asked to reinvent a classic dish from your favorite cuisine. What dish would you like to reinvent and how? Also, what name would you give.",
  "During a poker tournament, you realize the person next to you is Jeff Bezos. What would be your reaction?",
  "As a Hollywood Director you have an opportunity to re-write the ending for a famous movie of yours. Which moview would this be and what would be the alternate ending.",
  "You have the opportunity to suggest an unconventional team-building exercise that would actually make people want to participate enthusiastically. What would it be?",
  "You've just hit the jackpot on a slot machine. What are your immediate thoughts and how do you plan to handle this sudden wealth?",
];

const API_URL =
  "https://fastapi-server-1081098542602.us-central1.run.app/getToken/";

export type ConnectionDetails = {
  serverUrl: string;
  roomId: string;
  participantName: string;
  participantToken: string;
  dynamicContent: string;
};

async function fetchToken(
  participantName: string,
  roomId: string,
  SECRET_CODE: string,
  resumeSession: boolean = false,
  dynamicContent: string = ""
): Promise<string> {
  const requestBody = {
    room_name: roomId,
    name: participantName,
    secret_code: SECRET_CODE,
    resume_session: resumeSession,
    dynamic_content: dynamicContent,
  };

  try {
    // Make the API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch token: ${response.status} ${response.statusText}`
      );
    }

    // Parse the JSON response
    const data: TokenResponse = await response.json();

    // Validate the token in the response
    if (!data.token) {
      throw new Error("Token not found in the response");
    }

    // Log the generated token
    console.log("Generated Token from API:", data.token);

    // Return the token
    return data.token;
  } catch (error) {
    // Log and rethrow the error
    console.error("Error fetching token:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const LIVEKIT_URL = process.env.LIVEKIT_URL; // Securely store and fetch this from environment variables
    const SECRET_CODE = process.env.SECRET_CODE; // Use environment variable for the secret code

    if (!LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (!SECRET_CODE) {
      throw new Error("SECRET_CODE is not defined");
    }

    // Generate a random room ID and participant name
    const roomId = generateRandomRoomId();
    const participantName = `BC_${uuidv4()}`.slice(0, 20);

    function getRandomQuestions(arr: string[], num: number): string[] {
      const shuffled = arr.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }

    // Get 5 random questions
    const randomQuestions: string[] = getRandomQuestions(questions, 5);
    const resultString: string = JSON.stringify(randomQuestions);

    console.log("Selected random Questions are : ", randomQuestions);
    const dynamicContent = resultString;

    // Fetch the participant token
    const participantToken = await fetchToken(
      participantName,
      roomId,
      SECRET_CODE,
      false,
      dynamicContent
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomId,
      participantName,
      participantToken,
      dynamicContent,
    };

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in GET:", error.message);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function generateRandomRoomId(): string {
  return uuidv4();
}

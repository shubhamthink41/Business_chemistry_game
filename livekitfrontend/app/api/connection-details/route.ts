import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
interface TokenResponse {
  token: string;
  room_name: string;
  metadata: object;
}

const questions: string[] = [
  "What’s the most creative excuse you’ve ever used to get out of a meeting?",
  "If your inbox could talk, what would it say about you?",
  "You've won a massive casino jackpot tonight, but there's a catch - you must spend it entirely within 24 hours. What do you do?",
  "You just won the Vegas jackpot! What’s the first thing you’d do to celebrate?",
  "You have a winning in poker, but you need to raise money. How do you convince Jeff Bezos in the audience to lend you his money?",
  "If you could pick a celebrity to join your team for a week, who would it be and why?",
  "You are throwing a house party and have the opportunity to invite 3 famous celebrities. Who would they be and why?",
  "If you had to give your boss an unconventional award, what would it be? Why?",
  "What’s a corporate buzzword or phrase you secretly love (but won’t admit to anyone)?",
  "If you had to explain your job to a 5-year-old, what would you say?",
  "What’s the most unusual thing you’ve Googled during work hours?",
  "If your work persona were a superhero, what would your power be?",
  "If you could work from anywhere in the world, where would you set up shop?",
  "If you could bring one luxury item into the office, what would it be?",
  "If your office had a slot machine, what’s the jackpot—extra vacation days, free snacks, or meeting-free Fridays?",
  "You’re directing a parody of Mission Impossible called Mission Impractical. What’s the impossible task?",
  "What’s your go-to icebreaker when a meeting starts with awkward silence?",
  "You get to represent your country in your favourite sport, which sport would that be and what be your role?",
  "You are in Masterchef USA and you realize that you are missing an important ingredient. How do you convince your opponent to lend the same?",
  "You’re organizing a corporate retreat, and have the option of inviting the cast of a TV show. Who would you invite?",
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

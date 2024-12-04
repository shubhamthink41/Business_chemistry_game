import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
interface TokenResponse {
  token: string;
  room_name: string;
  metadata: object;
}

const questions: string[] = [
  "Your team is struggling with a critical project that's significantly behind schedule. Key team members are demotivated, and the client is becoming increasingly impatient. How would you turn this situation around and get the project back on track?",
  "You've discovered a potential major inefficiency in your organization's workflow that could save millions but would require restructuring several departments. Describe how you would approach presenting and implementing this transformative idea.",
  "A senior executive has proposed a strategy that you believe could potentially harm the company's long-term prospects. How would you navigate this delicate situation while maintaining professional relationships?",
  "Your team is experiencing significant communication breakdowns and internal conflicts that are impacting project delivery. What comprehensive approach would you take to rebuild team dynamics and improve collaboration?",
  "You find yourself leading a group of strangers through a challenging wilderness expedition with limited resources. Describe how you would ensure the team's survival and maintain group morale.",
  "A mysterious technological artifact has been discovered that could potentially change the course of human civilization. Walk us through your approach to understanding and responsibly managing this discovery.",
  "You've been given the opportunity to design a completely new society from scratch on an uninhabited planet. What fundamental principles and structures would you implement?",
  "An unexpected global crisis threatens the stability of human civilization. Outline your strategy for coordinating a response and helping humanity navigate this extreme challenge.",
  "You discover you have the ability to solve one global problem completely. Which problem would you choose, and how would you approach solving it?",
  "You're transported to a world where the laws of physics work differently. Describe how you would adapt and help your team survive in this completely alien environment.",
  "A time-travel opportunity allows you to make one significant intervention in human history. What would you choose to do, and how would you minimize unintended consequences?",
  "You've been given unlimited resources to create a revolutionary educational system that could transform how humans learn and grow. Describe your vision and approach.",
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

export async function fetchToken(
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

import { NextResponse } from "next/server";

interface TokenResponse {
  token: string;
}
// Environment variables for secure credentials
const API_URL = "https://fastapi-server-1081098542602.us-central1.run.app/getToken/";

export type ConnectionDetails = {
  serverUrl: string;
  roomId: string;
  participantName: string;
  participantToken: string;
};



export async function fetchToken(
  participantName: string,
  roomId: string,
  SECRET_CODE: string
): Promise<string> {
  // Construct the API URL with dynamic parameters
  const url = `https://fastapi-server-1081098542602.us-central1.run.app/getToken/?name=${participantName}&room_name=${roomId}&secret_code=${SECRET_CODE}`;

  try {
    // Make the API request
    const response = await fetch(url);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
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
    const LIVEKIT_URL = process.env.LIVEKIT_URL;
    const SECRET_CODE = "9f7694e7-518f-49dd-8a4b-c95f1a1ea5f8"; // Secret code for API call

    if (!LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (!SECRET_CODE) {
      throw new Error("SECRET_CODE is not defined");
    }

    // Generate a random room ID and participant name
    const roomId = generateRandomRoomId();
    const participantName = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;

    // Fetch the participant token
    const participantToken = await fetchToken(participantName, roomId, SECRET_CODE);

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomId,
      participantName,
      participantToken,
    };

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in GET:", error.message);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

// Helper function to generate a random room ID (alphanumeric string of 10 characters)
function generateRandomRoomId(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

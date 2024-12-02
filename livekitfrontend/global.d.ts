// global.d.ts
import { WebSocketServer } from "ws";

declare global {
  var wss: WebSocketServer | undefined; // Declare the property with its type
}

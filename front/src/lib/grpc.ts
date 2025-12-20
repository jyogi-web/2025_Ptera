import { createPromiseClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import {
  BattleService,
  PteraService,
} from "@/generated/ptera/v1/ptera_connect";

// Determine the backend URL (default to localhost for dev)
// In production, this should be an env variable
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:50051";

// Create transport for Node.js (HTTP/2 gRPC)
const transport = createGrpcTransport({
  baseUrl: BACKEND_URL,
  httpVersion: "2",
});

// Create the client
export const pteraClient = createPromiseClient(PteraService, transport);
export const battleClient = createPromiseClient(BattleService, transport);

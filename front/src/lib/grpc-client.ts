import { createClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { PteraService } from "../generated/ptera/v1/ptera_pb";

// Configure transport for server-side usage (gRPC over HTTP/2)
const transport = createGrpcTransport({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:50051",
});

export const pteraClient = createClient(PteraService, transport);

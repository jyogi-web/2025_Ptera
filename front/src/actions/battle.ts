"use server";

import { battleClient } from "@/lib/grpc";

// Using simple JSON serialization for passing data across serializable boundary if needed,
// but ConnectRPC types should be serializable.
// However, Server Actions arguments/return values must be serializable.
// Proto messages are classes in protobuf-es/connect-es, which might not be directly serializable by Next.js actions (React Server Actions).
// Best practice: Convert to plain info or use `toJson` / `fromJson`.

/**
 * Start Battle
 */
export async function startBattleAction(
  myCircleId: string,
  opponentCircleId: string,
) {
  try {
    const response = await battleClient.startBattle({
      myCircleId,
      opponentCircleId,
    });
    // Serialize to plain object to avoid Next.js warnings about "Plain Object"
    return JSON.parse(JSON.stringify(response.battleState));
  } catch (error) {
    console.error("StartBattle Error:", error);
    throw new Error(
      `Failed to start battle: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Attack
 */
export async function attackAction(battleId: string, playerId: string) {
  try {
    const response = await battleClient.attack({
      battleId,
      playerId,
    });
    return JSON.parse(JSON.stringify(response.battleState));
  } catch (error) {
    console.error("Attack Error:", error);
    throw new Error("Failed to attack");
  }
}

/**
 * Retreat
 */
export async function retreatAction(
  battleId: string,
  playerId: string,
  benchIndex: number,
) {
  try {
    const response = await battleClient.retreat({
      battleId,
      playerId,
      benchIndex,
    });
    return JSON.parse(JSON.stringify(response.battleState));
  } catch (error) {
    console.error("Retreat Error:", error);
    throw new Error("Failed to retreat");
  }
}

/**
 * Send Battle Request
 */
export async function sendBattleRequestAction(
  fromCircleId: string,
  toCircleId: string,
) {
  try {
    const response = await battleClient.sendBattleRequest({
      fromCircleId,
      toCircleId,
    });
    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.error("SendBattleRequest Error:", error);
    throw new Error("Failed to send battle request");
  }
}

/**
 * Accept Battle Request
 */
export async function acceptBattleRequestAction(requestId: string) {
  try {
    const response = await battleClient.acceptBattleRequest({
      requestId,
    });
    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.error("AcceptBattleRequest Error:", error);
    throw new Error("Failed to accept battle request");
  }
}

/**
 * Reject Battle Request
 */
export async function rejectBattleRequestAction(requestId: string) {
  try {
    const response = await battleClient.rejectBattleRequest({
      requestId,
    });
    return JSON.parse(JSON.stringify(response));
  } catch (error) {
    console.error("RejectBattleRequest Error:", error);
    throw new Error("Failed to reject battle request");
  }
}

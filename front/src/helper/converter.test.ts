import { describe, it, expect } from "vitest";
import { convertUser, convertCard } from "./converter";
import { Timestamp } from "firebase/firestore";
import type { UserInfo } from "firebase/auth";
import type { FirestoreCard } from "@/types/firestore";
import type { DocumentReference } from "firebase/firestore";

// FirestoreのTimestampのモック
const mockTimestamp = (date: Date) =>
  ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  }) as Timestamp;

// DocumentReferenceのモック
const mockDocRef = (id: string) =>
  ({
    id,
    path: `groups/${id}`,
  }) as DocumentReference<any>;

describe("converter", () => {
  describe("convertUser", () => {
    it("should convert UserInfo to User correctly", () => {
      const mockFirebaseUser: UserInfo = {
        uid: "user-123",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/avatar.jpg",
        phoneNumber: null,
        providerId: "google.com",
      };

      const result = convertUser(mockFirebaseUser);

      expect(result).toEqual({
        id: "user-123",
        name: "Test User",
        iconUrl: "https://example.com/avatar.jpg",
        email: "test@example.com",
      });
    });

    it("should handle missing optional fields", () => {
      const mockFirebaseUser: UserInfo = {
        uid: "user-456",
        displayName: null,
        photoURL: null,
        email: null,
        phoneNumber: null,
        providerId: "anonymous",
      };

      const result = convertUser(mockFirebaseUser);

      expect(result).toEqual({
        id: "user-456",
        name: "No Name",
        iconUrl: "",
        email: undefined,
      });
    });
  });

  describe("convertCard", () => {
    it("should convert FirestoreCard to Card correctly", () => {
      const date = new Date("2023-01-01T00:00:00Z");
      const mockData: FirestoreCard = {
        name: "Taro Yamada",
        grade: 2,
        position: "Member",
        hobby: "Reading",
        description: "Hello!",
        imageUrl: "https://example.com/card.jpg",
        creatorId: "user-123",
        affiliatedGroupRef: mockDocRef("group-abc"),
        createdAt: mockTimestamp(date),
      };

      const result = convertCard("card-123", mockData);

      expect(result).toEqual({
        id: "card-123",
        creatorId: "user-123",
        name: "Taro Yamada",
        grade: 2,
        position: "Member",
        affiliatedGroup: "group-abc",
        hobby: "Reading",
        description: "Hello!",
        imageUrl: "https://example.com/card.jpg",
        createdAt: date,
      });
    });

    it("should handle optional affiliatedGroupRef", () => {
      const date = new Date();
      const mockData: FirestoreCard = {
        name: "Hanako",
        grade: 1,
        position: "Leader",
        hobby: "Cooking",
        description: "Hi",
        imageUrl: "",
        creatorId: "user-456",
        affiliatedGroupRef: undefined,
        createdAt: mockTimestamp(date),
      };

      const result = convertCard("card-456", mockData);

      expect(result.affiliatedGroup).toBeUndefined();
    });
  });
});

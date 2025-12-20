import type { UserInfo } from "firebase/auth";
import type {
  DocumentData,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { describe, expect, it } from "vitest";
import type { FirestoreCard } from "@/types/firestore";
import { calculateGraduationDate, convertCard, convertUser } from "./converter";

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
  }) as DocumentReference<DocumentData>;

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
      const expiryDate = new Date("2027-01-01T00:00:00Z");
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

        expiryDate: mockTimestamp(expiryDate),
      };

      const result = convertCard("card-123", mockData);

      expect(result).toMatchObject({
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
        expiryDate: expiryDate,
      });

      // バトルステータスの存在と型をチェック
      expect(result.maxHp).toEqual(expect.any(Number));
      expect(result.attack).toEqual(expect.any(Number));
      expect(result.flavor).toEqual(expect.any(String));
      expect(result.maxHp).toBeGreaterThan(0);
      expect(result.attack).toBeGreaterThan(0);
    });

    it("should handle optional affiliatedGroupRef", () => {
      const date = new Date();
      const expiryDate = new Date(
        date.getTime() + 4 * 365 * 24 * 60 * 60 * 1000,
      );
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

        expiryDate: mockTimestamp(expiryDate),
      };

      const result = convertCard("card-456", mockData);

      expect(result.affiliatedGroup).toBeUndefined();
    });
  });

  describe("calculateGraduationDate", () => {
    describe("valid grade inputs", () => {
      it("should calculate correct graduation date for grade 1 (December academic year)", () => {
        const currentDate = new Date(2025, 11, 20); // December 20, 2025
        const result = calculateGraduationDate(1, currentDate);

        expect(result.getFullYear()).toBe(2029); // 2025 + (5-1) = 2029
        expect(result.getMonth()).toBe(2); // March (0-indexed)
        expect(result.getDate()).toBe(31);
      });

      it("should calculate correct graduation date for grade 2 (December academic year)", () => {
        const currentDate = new Date(2025, 11, 20); // December 20, 2025
        const result = calculateGraduationDate(2, currentDate);

        expect(result.getFullYear()).toBe(2028); // 2025 + (5-2) = 2028
        expect(result.getMonth()).toBe(2); // March (0-indexed)
        expect(result.getDate()).toBe(31);
      });

      it("should calculate correct graduation date for grade 3 (December academic year)", () => {
        const currentDate = new Date(2025, 11, 20); // December 20, 2025
        const result = calculateGraduationDate(3, currentDate);

        expect(result.getFullYear()).toBe(2027); // 2025 + (5-3) = 2027
        expect(result.getMonth()).toBe(2); // March (0-indexed)
        expect(result.getDate()).toBe(31);
      });

      it("should calculate correct graduation date for grade 4 (December academic year)", () => {
        const currentDate = new Date(2025, 11, 20); // December 20, 2025
        const result = calculateGraduationDate(4, currentDate);

        expect(result.getFullYear()).toBe(2026); // 2025 + (5-4) = 2026
        expect(result.getMonth()).toBe(2); // March (0-indexed)
        expect(result.getDate()).toBe(31);
      });
    });

    describe("academic year boundary behavior", () => {
      it("should use current year as academic year when date is in April or later", () => {
        const aprilDate = new Date(2025, 3, 1); // April 1, 2025
        const result = calculateGraduationDate(4, aprilDate);

        // Academic year = 2025, graduation year = 2025 + 1 = 2026
        expect(result.getFullYear()).toBe(2026);
        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(31);
      });

      it("should use previous year as academic year when date is in March or earlier", () => {
        const marchDate = new Date(2025, 2, 31); // March 31, 2025
        const result = calculateGraduationDate(4, marchDate);

        // Academic year = 2024, graduation year = 2024 + 1 = 2025
        expect(result.getFullYear()).toBe(2025);
        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(31);
      });

      it("should handle January boundary correctly", () => {
        const januaryDate = new Date(2025, 0, 15); // January 15, 2025
        const result = calculateGraduationDate(2, januaryDate);

        // Academic year = 2024, graduation year = 2024 + 3 = 2027
        expect(result.getFullYear()).toBe(2027);
        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(31);
      });

      it("should handle September boundary correctly", () => {
        const septemberDate = new Date(2025, 8, 15); // September 15, 2025
        const result = calculateGraduationDate(3, septemberDate);

        // Academic year = 2025, graduation year = 2025 + 2 = 2027
        expect(result.getFullYear()).toBe(2027);
        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(31);
      });
    });

    describe("invalid grade inputs", () => {
      it("should throw error for grade 0", () => {
        const currentDate = new Date(2025, 11, 20);

        expect(() => calculateGraduationDate(0, currentDate)).toThrow(
          "Grade must be an integer between 1 and 4",
        );
      });

      it("should throw error for grade 5", () => {
        const currentDate = new Date(2025, 11, 20);

        expect(() => calculateGraduationDate(5, currentDate)).toThrow(
          "Grade must be an integer between 1 and 4",
        );
      });

      it("should throw error for negative grade", () => {
        const currentDate = new Date(2025, 11, 20);

        expect(() => calculateGraduationDate(-1, currentDate)).toThrow(
          "Grade must be an integer between 1 and 4",
        );
      });

      it("should throw error for non-integer grade", () => {
        const currentDate = new Date(2025, 11, 20);

        expect(() => calculateGraduationDate(2.5, currentDate)).toThrow(
          "Grade must be an integer between 1 and 4",
        );
      });

      it("should throw error for NaN grade", () => {
        const currentDate = new Date(2025, 11, 20);

        expect(() => calculateGraduationDate(NaN, currentDate)).toThrow(
          "Grade must be an integer between 1 and 4",
        );
      });

      it("should throw error for Infinity grade", () => {
        const currentDate = new Date(2025, 11, 20);

        expect(() => calculateGraduationDate(Infinity, currentDate)).toThrow(
          "Grade must be an integer between 1 and 4",
        );
      });
    });

    describe("edge cases", () => {
      it("should handle leap year correctly", () => {
        const leapYearDate = new Date(2024, 1, 29); // February 29, 2024 (leap year)
        const result = calculateGraduationDate(1, leapYearDate);

        // Academic year = 2023, graduation year = 2023 + 4 = 2027
        expect(result.getFullYear()).toBe(2027);
        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(31);
      });

      it("should use current date as default when no date provided", () => {
        // This test verifies that the function works with default parameter
        const now = new Date();
        const result = calculateGraduationDate(4);

        // Calculate expected graduation date based on current date
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;
        const expectedGraduationYear = academicYear + (5 - 4); // +1 for grade 4

        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(31);
        expect(result.getFullYear()).toBe(expectedGraduationYear);
        expect(result.getTime()).toBeGreaterThanOrEqual(now.getTime()); // Should be in future
      });
    });
  });
});

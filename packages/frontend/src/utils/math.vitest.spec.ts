import { describe, expect, it } from "vitest";
import { add, divide, multiply } from "./math";

describe("Math Utils (Vitest)", () => {
  describe("add", () => {
    it("should add two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("should add negative numbers", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it("should add zero", () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe("multiply", () => {
    it("should multiply two positive numbers", () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it("should multiply by zero", () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it("should multiply negative numbers", () => {
      expect(multiply(-2, 3)).toBe(-6);
    });
  });

  describe("divide", () => {
    it("should divide two positive numbers", () => {
      expect(divide(10, 2)).toBe(5);
    });

    it("should handle decimal results", () => {
      expect(divide(7, 2)).toBe(3.5);
    });

    it("should throw error when dividing by zero", () => {
      expect(() => divide(5, 0)).toThrow("Division by zero is not allowed");
    });
  });
});

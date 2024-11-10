import {
  trimEndMultiple,
  trimMultiple,
  trimStartMultiple,
} from "../trimMultiple";

describe("String Trimming Utilities", () => {
  describe("trimStartMultiple", () => {
    it("removes multiple leading spaces and keeps only one space", () => {
      expect(trimStartMultiple("   Hello")).toBe(" Hello");
      expect(trimStartMultiple("     World")).toBe(" World");
    });

    it("does not modify strings with one leading space", () => {
      expect(trimStartMultiple(" Hello")).toBe(" Hello");
    });

    it("does not modify strings with no leading spaces", () => {
      expect(trimStartMultiple("Hello")).toBe("Hello");
    });
  });

  describe("trimEndMultiple", () => {
    it("removes multiple trailing spaces and keeps only one space", () => {
      expect(trimEndMultiple("Hello   ")).toBe("Hello ");
      expect(trimEndMultiple("World     ")).toBe("World ");
    });

    it("does not modify strings with one trailing space", () => {
      expect(trimEndMultiple("Hello ")).toBe("Hello ");
    });

    it("does not modify strings with no trailing spaces", () => {
      expect(trimEndMultiple("Hello")).toBe("Hello");
    });
  });

  describe("trimMultiple", () => {
    it("removes multiple leading and trailing spaces, keeping only one space each", () => {
      expect(trimMultiple("   Hello   ")).toBe(" Hello ");
      expect(trimMultiple("     World     ")).toBe(" World ");
    });

    it("handles strings with multiple leading spaces but no trailing spaces", () => {
      expect(trimMultiple("   Hello")).toBe(" Hello");
    });

    it("handles strings with multiple trailing spaces but no leading spaces", () => {
      expect(trimMultiple("Hello   ")).toBe("Hello ");
    });

    it("does not modify strings with no extra leading or trailing spaces", () => {
      expect(trimMultiple("Hello")).toBe("Hello");
      expect(trimMultiple(" Hello ")).toBe(" Hello ");
    });

    it("handles empty strings", () => {
      expect(trimMultiple("")).toBe("");
    });
  });
});

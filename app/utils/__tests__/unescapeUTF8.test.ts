// unescapeUTF8.test.ts

import { unescapeUTF8 } from "../unescapeUTF8";

describe("unescapeUTF8", () => {
  it("should decode percent-encoded ASCII characters", () => {
    const input = "Hello%20World%21";
    const expectedOutput = "Hello World!";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should decode percent-encoded single quotes", () => {
    const input = "%27Hello%20World%21%27";
    const expectedOutput = "'Hello World!'";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should decode mixed percent-encoded and plain characters", () => {
    const input = "Plain%20text%3A%20Hello%2C%20World!";
    const expectedOutput = "Plain text: Hello, World!";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should return the original string if no percent-encoded characters are present", () => {
    const input = "NoEncodedCharactersHere";
    const expectedOutput = "NoEncodedCharactersHere";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should decode consecutive percent-encoded characters correctly", () => {
    const input = "%41%42%43"; // Encoded "ABC"
    const expectedOutput = "ABC";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should handle an empty string", () => {
    const input = "";
    const expectedOutput = "";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should not modify invalid percent-encoded sequences", () => {
    const input = "Invalid%Sequence%G1";
    const expectedOutput = "Invalid%Sequence%G1"; // "%G1" is not valid
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });

  it("should decode numeric sequences correctly", () => {
    const input = "%30%31%32%33%34"; // Encoded "01234"
    const expectedOutput = "01234";
    expect(unescapeUTF8(input)).toBe(expectedOutput);
  });
});

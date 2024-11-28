/**
 * Clamps a number between a specified minimum and maximum value.
 *
 * This function ensures that the input `num` stays within the defined bounds:
 * - If `num` is less than or equal to `min`, it returns `min`.
 * - If `num` is greater than or equal to `max`, it returns `max`.
 * - Otherwise, it returns the original `num` value.
 *
 * @param num - The number to clamp.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @returns The clamped value, which will be within the range [min, max].
 *
 * Example usage:
 *   const clampedValue = clamp(10, 5, 15); // returns 10
 *   const clampedLow = clamp(2, 5, 15);   // returns 5
 *   const clampedHigh = clamp(20, 5, 15); // returns 15
 */
export const clamp = (num: number, min: number, max: number): number => {
  // If num is less than the min value, return the min
  return num <= min ? min : num >= max ? max : num; // Else, return num itself if it's between min and max
};

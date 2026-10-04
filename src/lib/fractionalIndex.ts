/**
 * Fractional indexing engine for O(1) card reordering without cascading database updates.
 * Computes deterministic midpoints between predecessor and successor positions.
 */

export const INITIAL_STEP = 1000.0;
export const MIN_FLOAT_DELTA = 0.000001;

export function calculateFractionalPosition(
  prevPosition: number | null | undefined,
  nextPosition: number | null | undefined
): number {
  // Case 1: Inserting into an empty list
  if (prevPosition == null && nextPosition == null) {
    return INITIAL_STEP;
  }

  // Case 2: Inserting at the beginning of the list (before the first item)
  if (prevPosition == null && nextPosition != null) {
    if (nextPosition <= 1.0) {
      return nextPosition / 2;
    }
    return Math.max(nextPosition - INITIAL_STEP, nextPosition / 2);
  }

  // Case 3: Inserting at the end of the list (after the last item)
  if (prevPosition != null && nextPosition == null) {
    return prevPosition + INITIAL_STEP;
  }

  // Case 4: Inserting between two items
  if (prevPosition != null && nextPosition != null) {
    // If positions are inverted or equal due to race condition, rebalance slightly
    if (prevPosition >= nextPosition) {
      return prevPosition + 0.5;
    }

    const midpoint = (prevPosition + nextPosition) / 2.0;

    // Check if gap is dangerously narrow (approaching floating-point limit)
    if (Math.abs(nextPosition - prevPosition) < MIN_FLOAT_DELTA) {
      console.warn("⚠️ Fractional index gap very narrow. Rebalancing might be needed.");
    }

    return midpoint;
  }

  return INITIAL_STEP;
}

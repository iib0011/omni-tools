/**
 * Cryptographically secure random number generator utilities.
 *
 * Uses the Web Crypto API (`crypto.getRandomValues`) instead of `Math.random()`
 * to prevent predictable outputs in security-sensitive contexts such as
 * password generation.
 */

/**
 * Returns a cryptographically secure random integer in the range [0, max).
 *
 * Uses rejection sampling to eliminate the modulo bias that would otherwise
 * occur when `max` does not evenly divide the output range of the underlying
 * random source.
 *
 * @param max The upper bound (exclusive). Must be a positive integer.
 * @returns A secure random integer in [0, max).
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new Error('max must be a positive integer');
  }

  // Uint32Array produces values in [0, 2^32 - 1], giving 2^32 possible values.
  const range = 0x100000000; // 2^32

  // Number of values that would introduce bias if we used plain modulo.
  const rejected = range % max;

  // Values >= this threshold are rejected to ensure a uniform distribution.
  const limit = range - rejected;

  const array = new Uint32Array(1);

  // Rejection sampling loop.
  // The rejection zone is extremely small for typical charset sizes (~90),
  // so this will almost always succeed on the first iteration.
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);

  return array[0] % max;
}

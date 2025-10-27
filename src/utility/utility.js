/**
 * Collection of reusable JavaScript utility functions.
 * Each function is exported individually as well as aggregated in the default export.
 */

/**
 * Splits an array into chunks of a given size.
 * @template T
 * @param {T[]} arr - Source array.
 * @param {number} size - Size of each chunk (must be greater than 0).
 * @returns {T[][]}
 */
export function chunk(arr, size) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Expected an array');
  }
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError('Chunk size must be a positive integer');
  }
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Flattens an array one level deep.
 * @template T
 * @param {any[]} arr - Array that may contain nested arrays.
 * @returns {T[]}
 */
export function flatten(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Expected an array');
  }
  return arr.reduce((acc, value) => {
    if (Array.isArray(value)) {
      acc.push(...value);
    } else {
      acc.push(value);
    }
    return acc;
  }, []);
}

/**
 * Removes falsy values from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function compact(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Expected an array');
  }
  return arr.filter(Boolean);
}

/**
 * Computes the difference between two arrays.
 * @template T
 * @param {T[]} arr1
 * @param {T[]} arr2
 * @returns {T[]}
 */
export function difference(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    throw new TypeError('Expected arrays');
  }
  const exclude = new Set(arr2);
  return arr1.filter((item) => !exclude.has(item));
}

/**
 * Returns the intersection of two arrays.
 * @template T
 * @param {T[]} arr1
 * @param {T[]} arr2
 * @returns {T[]}
 */
export function intersection(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    throw new TypeError('Expected arrays');
  }
  const values = new Set(arr2);
  return arr1.filter((item) => values.has(item));
}

/**
 * Decodes a base64url encoded string and parses it as JSON.
 * @param {string} base64Url
 * @returns {any}
 */
export function base64UrlDecode(base64Url) {
  if (typeof base64Url !== 'string') {
    throw new TypeError('Expected a string');
  }
  const padLength = (4 - (base64Url.length % 4)) % 4;
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);

  let binaryString;
  if (typeof atob === 'function') {
    binaryString = atob(base64);
  } else if (typeof Buffer !== 'undefined') {
    binaryString = Buffer.from(base64, 'base64').toString('binary');
  } else if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    binaryString = window.atob(base64);
  } else {
    throw new Error('No base64 decoder available in this environment');
  }

  const percentEncoded = binaryString
    .split('')
    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('');

  const decoded = decodeURIComponent(percentEncoded);
  try {
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Decoded value is not valid JSON');
  }
}

/**
 * Parses the payload from a JSON Web Token string.
 * @param {string} token
 * @returns {any}
 */
export function parseJwt(token) {
  if (typeof token !== 'string') {
    throw new TypeError('Expected a string token');
  }
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format');
  }
  return base64UrlDecode(parts[1]);
}

/**
 * Creates a new object with only the specified keys.
 * @template T extends object
 * @param {T} obj
 * @param {Array<keyof T>} keys
 * @returns {Partial<T>}
 */
export function pick(obj, keys) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('Expected an object');
  }
  if (!Array.isArray(keys)) {
    throw new TypeError('Expected an array of keys');
  }
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

/**
 * Creates a new object omitting the specified keys.
 * @template T extends object
 * @param {T} obj
 * @param {Array<keyof T>} keys
 * @returns {Partial<T>}
 */
export function omit(obj, keys) {
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('Expected an object');
  }
  if (!Array.isArray(keys)) {
    throw new TypeError('Expected an array of keys');
  }
  const omitSet = new Set(keys);
  return Object.keys(obj).reduce((acc, key) => {
    if (!omitSet.has(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

/**
 * Performs a deep equality check between two values.
 * @param {any} value
 * @param {any} other
 * @returns {boolean}
 */
export function isEqual(value, other) {
  if (value === other) {
    return true;
  }
  if (value === null || other === null || typeof value !== 'object' || typeof other !== 'object') {
    return false;
  }

  if (value instanceof Date && other instanceof Date) {
    return value.getTime() === other.getTime();
  }

  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) {
      return false;
    }
    return value.every((item, index) => isEqual(item, other[index]));
  }

  const keysA = Object.keys(value);
  const keysB = Object.keys(other);
  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => Object.prototype.hasOwnProperty.call(other, key) && isEqual(value[key], other[key]));
}

/**
 * Checks if an object has no enumerable properties.
 * @param {object | null | undefined} obj
 * @returns {boolean}
 */
export function isEmpty(obj) {
  if (obj == null) {
    return true;
  }
  if (Array.isArray(obj) || typeof obj === 'string') {
    return obj.length === 0;
  }
  if (obj instanceof Map || obj instanceof Set) {
    return obj.size === 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  return false;
}

/**
 * Capitalizes the first character of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  if (str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to a given length and appends an ellipsis if needed.
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
export function truncate(str, length) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError('Length must be a non-negative integer');
  }
  if (str.length <= length) {
    return str;
  }
  if (length === 0) {
    return '';
  }
  const ellipsis = '…';
  if (length === 1) {
    return ellipsis;
  }
  return str.slice(0, length - 1) + ellipsis;
}

/**
 * Removes HTML tags from a string.
 * @param {string} str
 * @returns {string}
 */
export function stripTags(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Converts a string into a URL-friendly slug.
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Reverses the characters in a string.
 * @param {string} str
 * @returns {string}
 */
export function reverse(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return [...str].reverse().join('');
}

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} num
 * @param {number} [places=0]
 * @returns {number}
 */
export function round(num, places = 0) {
  if (typeof num !== 'number' || Number.isNaN(num)) {
    throw new TypeError('Expected a valid number');
  }
  if (!Number.isInteger(places) || places < 0) {
    throw new RangeError('Places must be a non-negative integer');
  }
  const factor = 10 ** places;
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Generates a random integer within the inclusive range [min, max].
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected numeric bounds');
  }
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new RangeError('Bounds must be integers');
  }
  if (max < min) {
    throw new RangeError('Max must be greater than or equal to min');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the factorial of a non-negative integer.
 * @param {number} num
 * @returns {number}
 */
export function factorial(num) {
  if (!Number.isInteger(num)) {
    throw new TypeError('Expected an integer');
  }
  if (num < 0) {
    throw new RangeError('Factorial is not defined for negative numbers');
  }
  if (num === 0 || num === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= num; i += 1) {
    result *= i;
  }
  return result;
}

/**
 * Computes the nth Fibonacci number iteratively.
 * @param {number} n
 * @returns {number}
 */
export function fibonacci(n) {
  if (!Number.isInteger(n)) {
    throw new TypeError('Expected an integer');
  }
  if (n < 0) {
    throw new RangeError('Fibonacci is not defined for negative numbers');
  }
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i += 1) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

const utilityService = {
  chunk,
  flatten,
  compact,
  difference,
  intersection,
  base64UrlDecode,
  parseJwt,
  pick,
  omit,
  isEqual,
  isEmpty,
  capitalize,
  truncate,
  stripTags,
  slugify,
  reverse,
  round,
  randomInt,
  factorial,
  fibonacci,
};

export default utilityService;

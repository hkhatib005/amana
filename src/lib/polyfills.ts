const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Hermes has neither `Buffer` nor `btoa`; the Quran Foundation API client needs one to build its Basic Auth header. */
function btoaPolyfill(input: string): string {
  let output = '';
  for (let i = 0; i < input.length; i += 3) {
    const a = input.charCodeAt(i);
    const b = input.charCodeAt(i + 1);
    const c = input.charCodeAt(i + 2);
    output += BASE64_CHARS[a >> 2];
    output += BASE64_CHARS[((a & 3) << 4) | (Number.isNaN(b) ? 0 : b >> 4)];
    output += Number.isNaN(b) ? '=' : BASE64_CHARS[((b & 15) << 2) | (Number.isNaN(c) ? 0 : c >> 6)];
    output += Number.isNaN(c) ? '=' : BASE64_CHARS[c & 63];
  }
  return output;
}

if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = btoaPolyfill;
}

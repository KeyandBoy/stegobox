/**
 * RAC-Hide — public, environment-agnostic entry point.
 *
 * ```js
 * import { buildPayload, embed, extract, capacityBytes } from 'rac-hide';
 * ```
 *
 * The browser-only helpers live in `rac-hide/browser`.
 *
 * @module rac-hide
 */
export {
  BLOCK_SIZE,
  MAGIC,
  MAGIC_V2,
  PAYLOAD_TYPE_IMAGE,
  PAYLOAD_TYPE_FILE,
  PAYLOAD_TYPE_TEXT,
  CODEWORD_BITS,
  PAYLOAD_HEADER_BYTES,
  PAYLOAD_V2_HEADER_BYTES,
  COEFFICIENT_PAIRS,
  DEFAULT_OPTIONS,
} from './constants.js';
export { dct2d, idct2d } from './dct.js';
export { ReedSolomon } from './reed-solomon.js';
export { slotForIndex, deinterleave } from './interleave.js';
export { buildRulerField, readRulerSize, detectRulerSize, encodeRulerBits, decodeRulerBits } from './ruler.js';
export { capacityBytes, buildPayload, buildTypedPayload, typedHeaderBytes, embed, extract } from './core.js';

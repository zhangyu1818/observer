import { Raw } from '../interface';
import baseHandler from './base-handler';
import collectionsHandlers from './collections';

const handlers = new Map<object, any>([
  [Map, collectionsHandlers],
  [Set, collectionsHandlers],
  [WeakMap, collectionsHandlers],
  [WeakSet, collectionsHandlers],
  [Object, false],
  [Array, false],
  [Int8Array, false],
  [Uint8Array, false],
  [Uint8ClampedArray, false],
  [Int16Array, false],
  [Uint16Array, false],
  [Int32Array, false],
  [Uint32Array, false],
  [Float32Array, false],
  [Float64Array, false],
]);

const getHandler = (obj: Raw) => {
  return handlers.get(obj.constructor) || baseHandler;
};

export default getHandler;

import { Key, Observable, Raw } from '../interface';
import { hasOwnProperty, ITERATION_KEY, proxyToRaw, UNUSED_TEMP_KEY } from '../internals';
import { queueReactionsForOperation, registerRunningReactionForOperation } from '../reaction';
import { findObservable } from '../utils';

const getTargetFromProxy = (observable: Observable) => proxyToRaw.get(observable) as any;

const patchIterator = (iterator: IterableIterator<unknown>, isEntries: boolean = false) => {
  const originalNext = iterator.next;
  iterator.next = () => {
    let { done, value } = originalNext.call(iterator);
    if (!done) {
      if (isEntries) {
        value[1] = findObservable(value[1]);
      } else {
        value = findObservable(value);
      }
    }
    return { done, value };
  };
  return iterator;
};

const intercepts = {
  get(key: Key) {
    // Reflect.get时第三个参数receiver会作为调用的this，所以这个this就是被observable后的Map
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key });
    return findObservable(target.get(key));
  },
  set(key: Key, value) {
    const target = getTargetFromProxy(this);
    const hadKey = target.has(key);
    const oldValue = target.get(key);
    const result = target.set(key, value);
    if (!hadKey) {
      queueReactionsForOperation({ target, key, type: 'add' });
    } else if (value !== oldValue) {
      queueReactionsForOperation({ target, key, type: 'set' });
    }
    return result;
  },
  has(key: Key) {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key });
    return target.has(key);
  },
  add(key: Key, value) {
    const target = getTargetFromProxy(this);
    const hadKey = target.has(key);
    // 在调用观察函数前先执行操作
    const result = target.add(key, value);
    if (!hadKey) {
      queueReactionsForOperation({ target, key, type: 'add' });
    }
    return result;
  },
  delete(key: Key) {
    const target = getTargetFromProxy(this);
    const hadKey = target.has(key);
    if (hadKey) {
      queueReactionsForOperation({ target, key, type: 'delete' });
    }
  },
  clear() {
    const target = getTargetFromProxy(this);
    const hadItems = target.size !== 0;
    const result = target.clear();
    if (hadItems) {
      queueReactionsForOperation({ target, key: UNUSED_TEMP_KEY, type: 'clear' });
    }
    return result;
  },
  forEach(callback, thisArg) {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key: ITERATION_KEY });
    const wrappedCallback = (value, ...rest) => callback(findObservable(value), ...rest);
    return target.forEach(wrappedCallback, thisArg);
  },
  keys() {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key: ITERATION_KEY });
    return target.keys();
  },
  values() {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key: ITERATION_KEY });
    const iterator = target.values();
    return patchIterator(iterator);
  },
  entries() {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key: ITERATION_KEY });
    const iterator = target.entries();
    return patchIterator(iterator, true);
  },
  [Symbol.iterator]() {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key: ITERATION_KEY });
    const iterator = target[Symbol.iterator]();
    return patchIterator(iterator, target instanceof Map);
  },
  get size() {
    const target = getTargetFromProxy(this);
    registerRunningReactionForOperation({ target, key: ITERATION_KEY });
    return target.size;
  },
};

function get(target: Raw, key: Key, receiver: Observable) {
  target = hasOwnProperty.call(intercepts, key) ? intercepts : target;
  return Reflect.get(target, key, receiver);
}

const collectionsHandlers = {
  get,
};

export default collectionsHandlers;

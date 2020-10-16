import { Key, Observable, Raw } from '../interface';
import { hasOwnProperty, ITERATION_KEY, proxyToRaw, rawToProxy } from '../internals';
import {
  hasRunningReaction,
  queueReactionsForOperation,
  registerRunningReactionForOperation,
} from '../reaction';
import { observable } from '../observable';

const isObject = (obj) => typeof obj === 'object' && obj !== null;

const wellKnownSymbols = new Set<symbol>(
  Object.getOwnPropertyNames(Symbol)
    .map((key) => Symbol[key])
    .filter((value) => typeof value === 'symbol')
);

/**
 * 拦截get操作获取那一个观察函数使用了相应的属性
 * @param target
 * @param key
 * @param receiver
 */
function get(target: Raw, key: Key, receiver: Observable) {
  const result = Reflect.get(target, key, receiver);

  // 不观察内置的Symbols
  if (typeof key === 'symbol' && wellKnownSymbols.has(key)) {
    return result;
  }
  // 收集依赖
  registerRunningReactionForOperation({ target, key });

  // 如果访问的result是对象，则转为observable
  const observableResult = rawToProxy.get(result);
  // 如果有正在运行的观察函数才将新对象转为observable对象
  if (hasRunningReaction() && isObject(result)) {
    if (observableResult) {
      return observableResult;
    }
    return observable(result);
  }

  return observableResult || result;
}

function set(target: Raw, key: Key, value: any, receiver: Observable) {
  if (isObject(value)) {
    value = proxyToRaw.get(value) || value;
  }

  const hadKey = hasOwnProperty.call(target, key);
  const oldValue = target[key];

  const result = Reflect.set(target, key, value, receiver);

  if (target !== proxyToRaw.get(receiver)) {
    return result;
  }

  // 触发观察者函数
  if (!hadKey) {
    queueReactionsForOperation({ target, key, type: 'add' });
  } else if (value !== oldValue) {
    queueReactionsForOperation({ target, key, type: 'set' });
  }

  return result;
}

function ownKeys(target: Raw) {
  registerRunningReactionForOperation({ target, key: ITERATION_KEY });
  return Reflect.ownKeys(target);
}

function deleteProperty(target: Raw, key: Key) {
  const hadKey = hasOwnProperty.call(target, key);
  const result = Reflect.deleteProperty(target, key);
  if (hadKey) {
    queueReactionsForOperation({ target, key, type: 'delete' });
  }

  return result;
}

const baseHandler = {
  get,
  set,
  ownKeys,
  deleteProperty,
};

export default baseHandler;

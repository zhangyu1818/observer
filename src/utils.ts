import { rawToProxy } from './internals';
import { hasRunningReaction } from './reaction';
import { observable } from './observable';
import { Raw } from './interface';

export const isObject = (obj) => typeof obj === 'object' && obj !== null;

export const findObservable = (raw: Raw) => {
  // 如果访问的result是对象，则转为observable
  const observableResult = rawToProxy.get(raw);
  // 如果有正在运行的观察函数才将新对象转为observable对象
  if (hasRunningReaction() && isObject(raw)) {
    if (observableResult) {
      return observableResult;
    }
    return observable(raw);
  }
  return observableResult || raw;
};

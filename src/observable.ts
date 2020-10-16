import { Raw } from './interface';
import { proxyToRaw, rawToProxy } from './internals';
import { storeObservable } from './store';
import getHandler from './handlers';

function createObservable<T extends Raw>(raw: T) {
  // 捕捉器，get、set
  const handler = getHandler(raw);

  const observable = new Proxy(raw, handler);

  // proxy对象和raw原始对象的映射
  rawToProxy.set(raw, observable);
  proxyToRaw.set(observable, raw);

  // 储存原始对象以获取原始对象的key所对应的依赖函数
  storeObservable(raw);

  return observable;
}

export function observable<T extends Raw>(raw: T) {
  // 如果已经是proxy的对象，直接返回
  if (proxyToRaw.has(raw)) {
    return raw;
  }

  // 如果原始对象有对应的proxy对象则返回，没有则创建一个新的proxy对象
  return (rawToProxy.get(raw) || createObservable(raw)) as T;
}

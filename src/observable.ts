import { Raw } from './interface';
import { proxyToRaw, rawToProxy } from './internals';
import { storeObservable } from './store';
import getHandler from './handlers';

function createObservable<T extends Raw>(raw: T) {
  const handler = getHandler();

  const observable = new Proxy(raw, handler);

  rawToProxy.set(raw, observable);
  proxyToRaw.set(observable, raw);

  storeObservable(raw);

  return observable;
}

export function observable<T extends Raw>(raw: T) {
  if (proxyToRaw.has(raw)) {
    return raw;
  }

  return rawToProxy.get(raw) || createObservable(raw);
}

import { Key, Observable, Raw } from '../interface';
import { queueReactionsForOperation, registerRunningReactionForOperation } from '../reaction';

function get(target: Raw, key: Key, receiver: Observable) {
  const result = Reflect.get(target, key, receiver);

  registerRunningReactionForOperation({ target, key });

  return result;
}

function set(target: Raw, key: Key, value: any, receiver: Observable) {
  const result = Reflect.set(target, key, value, receiver);

  queueReactionsForOperation({ target, key });

  return result;
}

const baseHandler = {
  get,
  set,
};

export default baseHandler;

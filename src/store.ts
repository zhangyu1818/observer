import {
  Key,
  Operation,
  OperationWithType,
  Raw,
  ReactionFunction,
  ReactionsForKey,
  ReactionsForRaw,
} from './interface';
import { ITERATION_KEY } from './internals';

const connectionStore = new WeakMap<Raw, ReactionsForRaw>();

export function storeObservable(raw: Raw) {
  connectionStore.set(raw, new Map() as ReactionsForRaw);
}

/**
 * 注册观察函数
 * @param reaction 观察函数
 * @param target 原始对象
 * @param key 观察函数所对应的key
 */
export function registerReactionForOperation(
  reaction: ReactionFunction,
  { target, key }: Operation
) {
  // 取得原始对象所对应的该对象的观察函数Map<key，观察函数Set>
  const reactionForRow = connectionStore.get(target);
  if (!reactionForRow) return;
  // 当前key所对应的观察者函数Set
  let reactionForKey = reactionForRow.get(key);
  if (!reactionForKey) {
    // 如果当前key没有对应的观察者Set，说明这是第一个添加的观察者函数
    // 新创建一个Set，同时将存入该对象的观察函数Map<key,观察者Set>
    reactionForKey = new Set<ReactionFunction>();
    reactionForRow.set(key, reactionForKey);
  }
  // 如果当前的观察函数没有添加进Set，则添加
  if (!reactionForKey.has(reaction)) {
    reactionForKey.add(reaction);
    reaction.cleaners?.push(reactionForKey);
  }
}

/**
 * 获取当前target中，key对应的观察者函数Set
 * @param target
 * @param key
 * @param type
 */
export function getReactionsForOperation({ target, key, type }: OperationWithType) {
  const reactionsForRaw = connectionStore.get(target)!;
  const reactionsForKey = new Set<ReactionFunction>();
  addReactionsForKey(reactionsForKey, reactionsForRaw, key);

  if (type === 'add' || type === 'delete') {
    const iterationKey = Array.isArray(target) ? 'length' : ITERATION_KEY;
    addReactionsForKey(reactionsForKey, reactionsForRaw, iterationKey);
  }

  return reactionsForKey;
}

/**
 * 遍历观察者函数Set，返回一个新Set
 * @param reactionsForKey
 * @param reactionsForRaw
 * @param key
 */
function addReactionsForKey(
  reactionsForKey: ReactionsForKey,
  reactionsForRaw: ReactionsForRaw,
  key: Key
) {
  const reactions = reactionsForRaw.get(key);
  if (reactions) {
    reactions.forEach((reaction) => {
      reactionsForKey.add(reaction);
    });
  }
  return reactionsForKey;
}

export function releaseReaction(reaction: ReactionFunction) {
  if (reaction.cleaners) {
    reaction.cleaners.forEach((reactionsForKey) => {
      reactionsForKey.delete(reaction);
    });
  }
  reaction.cleaners = [];
}

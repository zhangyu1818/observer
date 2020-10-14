import {
  Key,
  Operation,
  Raw,
  ReactionFunction,
  ReactionsForKey,
  ReactionsForRaw,
} from './interface';

const connectionStore = new WeakMap<Raw, ReactionsForRaw>();

export function storeObservable(raw: Raw) {
  connectionStore.set(raw, new Map() as ReactionsForRaw);
}

export function registerReactionForOperation(
  reaction: ReactionFunction,
  { target, key }: Operation
) {
  const reactionForRow = connectionStore.get(target);
  if (!reactionForRow) return;
  let reactionForKey = reactionForRow.get(key);
  if (!reactionForKey) {
    reactionForKey = new Set<ReactionFunction>();
    reactionForRow.set(key, reactionForKey);
  }
  if (!reactionForKey.has(reaction)) {
    reactionForKey.add(reaction);
  }
}

export function getReactionsForOperation({ target, key }: Operation) {
  const reactionsForRaw = connectionStore.get(target)!;
  const reactionsForKey = addReactionsForKey(reactionsForRaw, key);
  return reactionsForKey;
}

function addReactionsForKey(reactionsForRaw: ReactionsForRaw, key: Key) {
  const reactionsForKey: ReactionsForKey = new Set<ReactionFunction>();
  const reactions = reactionsForRaw.get(key);
  if (reactions) {
    reactions.forEach((reaction) => {
      reactionsForKey.add(reaction);
    });
  }
  return reactionsForKey;
}

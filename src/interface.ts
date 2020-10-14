export type Raw = object;
export type Observable = object;
export type Key = PropertyKey;

export type ReactionFunction = Function;

export type ReactionsForKey = Set<ReactionFunction>;
export type ReactionsForRaw = Map<Key, ReactionsForKey>;

export type Operation = {
  target: Raw;
  key: Key;
};

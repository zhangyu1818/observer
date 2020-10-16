export type Raw = object;
export type Observable = object;
export type Key = PropertyKey;

export type ReactionFunction = Function & {
  unobserved?: boolean;
  cleaners?: ReactionsForKey[];
};

export type ReactionsForKey = Set<ReactionFunction>;
export type ReactionsForRaw = Map<Key, ReactionsForKey>;

export interface Operation {
  target: Raw;
  key: Key;
}

export interface OperationWithType extends Operation {
  type: 'add' | 'set' | 'delete' | 'clear';
}

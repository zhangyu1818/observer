import { ReactionFunction } from './interface';
import { runAsReaction } from './reaction';

export function observe(fn: ReactionFunction) {
  const reaction = (...args: any[]) => {
    return runAsReaction(reaction, fn, this, args);
  };

  reaction();
}

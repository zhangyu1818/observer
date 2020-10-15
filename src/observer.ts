import { ReactionFunction } from './interface';
import { runAsReaction } from './reaction';
import { releaseReaction } from './store';

const IS_REACTION = Symbol('is reaction');

export function observe(fn: ReactionFunction) {
  const reaction: ReactionFunction = fn[IS_REACTION]
    ? fn
    : (...args) => {
        return runAsReaction(reaction, fn, this, args);
      };

  reaction[IS_REACTION] = true;

  reaction();

  return reaction;
}

export function unobserve(fn: ReactionFunction) {
  if (!fn.unobserved) {
    fn.unobserved = true;
    releaseReaction(fn);
  }
}

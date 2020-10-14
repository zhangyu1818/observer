import { Operation, ReactionFunction } from './interface';
import { getReactionsForOperation, registerReactionForOperation } from './store';

const reactionStack: ReactionFunction[] = [];

function isRunningReaction(reaction: ReactionFunction) {
  return reactionStack.indexOf(reaction) !== -1;
}

export function runAsReaction(reaction: ReactionFunction, fn: Function, context: any, args: any[]) {
  if (isRunningReaction(reaction)) return;
  try {
    reactionStack.push(reaction);
    return Reflect.apply(fn, context, args);
  } finally {
    reactionStack.pop();
  }
}

export function registerRunningReactionForOperation(operation: Operation) {
  const runningReaction = reactionStack[reactionStack.length - 1];
  if (runningReaction) {
    registerReactionForOperation(runningReaction, operation);
  }
}

export function queueReactionsForOperation(operation: Operation) {
  getReactionsForOperation(operation).forEach((reaction) => {
    reaction();
  });
}

import { Operation, OperationWithType, ReactionFunction } from './interface';
import { getReactionsForOperation, registerReactionForOperation, releaseReaction } from './store';

const reactionStack: ReactionFunction[] = [];

function isRunningReaction(reaction: ReactionFunction) {
  return reactionStack.indexOf(reaction) !== -1;
}

export function hasRunningReaction() {
  return reactionStack.length !== 0;
}

export function runAsReaction(reaction: ReactionFunction, fn: Function, context: any, args: any[]) {
  if (reaction.unobserved) {
    return Reflect.apply(fn, context, args);
  }

  // 如果当前的观察者函数已经在队列中
  if (isRunningReaction(reaction)) return;

  // 清空对应的reactionsForKey
  releaseReaction(reaction);

  try {
    // 添加当前的观察者函数到队列
    reactionStack.push(reaction);
    // 调用会触发Proxy的get捕获，在get捕获函数里，就可以从当前队列获取到对应的观察者函数
    return Reflect.apply(fn, context, args);
  } finally {
    // 运行结束后从队里移除
    reactionStack.pop();
  }
}

/**
 * 注册正在运行的观察函数
 * @param operation {target,key}
 */
export function registerRunningReactionForOperation(operation: Operation) {
  // 当有函数正在运行时，这时候在函数内部可以通过proxy获取到那些key被访问，同时可以获取该函数的实例
  const runningReaction = reactionStack[reactionStack.length - 1];
  if (runningReaction) {
    registerReactionForOperation(runningReaction, operation);
  }
}

/**
 * 触发观察者函数
 * @param operation {target,key}
 */
export function queueReactionsForOperation(operation: OperationWithType) {
  getReactionsForOperation(operation).forEach((reaction) => {
    reaction();
  });
}

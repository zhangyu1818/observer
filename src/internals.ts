import { Observable, Raw } from './interface';

export const rawToProxy = new WeakMap<Raw, Observable>();
export const proxyToRaw = new WeakMap<Observable, Raw>();

export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const ITERATION_KEY = Symbol('iteration key');

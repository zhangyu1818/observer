import { Observable, Raw } from './interface';

export const rawToProxy = new WeakMap<Raw, Observable>();
export const proxyToRaw = new WeakMap<Observable, Raw>();

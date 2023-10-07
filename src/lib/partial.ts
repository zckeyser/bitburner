/**
 * Partially applies arguments to a function
 * @param {} fn 
 * @param  {...any} args 
 * @returns  (...args) => any
 */
export function partial<T>(fn: (...args) => T, ...partialArgs: any[]): (...args: any) => T {
     return (...lastArgs) => { return fn(...partialArgs, ...lastArgs); }
}
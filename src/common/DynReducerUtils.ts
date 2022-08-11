import type { IDerivedReducerCtor } from '../types/index.js';

export class DynReducerUtils
{
   /**
    * Checks for array equality between two arrays of numbers.
    *
    * @param a - Array A
    *
    * @param b - Array B
    *
    * @returns Arrays are equal.
    */
   static arrayEquals(a: any[], b: any[]): boolean
   {
      if (a === b) { return true; }
      if (a === null || b === null) { return false; }

      /* c8 ignore next */
      if (a.length !== b.length) { return false; }

      for (let cntr = a.length; --cntr >= 0;)
      {
         /* c8 ignore next */
         if (a[cntr] !== b[cntr]) { return false; }
      }

      return true;
   }

   /**
    * @param target -
    *
    * @param Prototype -
    *
    * @returns target constructor function has Prototype.
    */
   static hasPrototype(target: any, Prototype: IDerivedReducerCtor<any>): boolean
   {
      /* c8 ignore next */
      if (typeof target !== 'function') { return false; }

      if (target === Prototype) { return true; }

      // Walk parent prototype chain. Check for descriptor at each prototype level.
      for (let proto = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto))
      {
         if (proto === Prototype) { return true; }
      }

      return false;
   }

   /**
    * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
    *
    * @param data - Data to verify as iterable.
    *
    * @returns Is data iterable.
    */
   static isIterable(data: any): boolean
   {
      return data !== null && data !== void 0 && typeof data === 'object' &&
       typeof data[Symbol.iterator] === 'function';
   }
}

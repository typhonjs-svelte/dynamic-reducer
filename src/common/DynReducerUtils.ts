import type { DynReducer } from '../types';

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
   static arrayEquals(a: any[] | null, b: any[] | null): boolean
   {
      if (a === b) { return true; }

      /* c8 ignore next */
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
    * Provides a solid string hashing algorithm.
    *
    * Sourced from: https://stackoverflow.com/a/52171480
    *
    * @param str - String to hash.
    *
    * @param seed - A seed value altering the hash.
    *
    * @returns Hash code.
    */
   static hashString(str: string | undefined, seed: number = 0): number
   {
      /* c8 ignore next */
      if (str === void 0 || str === null) { return 0; }

      let h1: number = 0xdeadbeef ^ seed, h2: number = 0x41c6ce57 ^ seed;

      for (let ch: number, i = 0; i < str.length; i++)
      {
         ch = str.charCodeAt(i);
         h1 = Math.imul(h1 ^ ch, 2654435761);
         h2 = Math.imul(h2 ^ ch, 1597334677);
      }

      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

      return 4294967296 * (2097151 & h2) + (h1 >>> 0);
   }

   /**
    * Converts an unknown value for hashing purposes in {@link AdapterIndexer.calcHashUpdate}.
    *
    * Currently, objects / Map w/ object keys is not supported. Potentially can include `object-hash` to handle this
    * case, but it is not common to use objects as keys in Maps.
    *
    * @param value - An unknown value to convert to a number.
    */
   static hashUnknown(value: unknown): number
   {
      if (value === null || value === void 0) { return 0; }

      let result: number = 0;

      switch (typeof value)
      {
         case 'boolean':
            result = value ? 1 : 0;
            break;

         case 'bigint':
            result = Number(BigInt.asIntN(64, value));
            break;

         case 'function':
            result = this.hashString(value.name);
            break;

         case 'number':
            result = Number.isFinite(value) ? value : 0;
            break;

         case 'object':
            // TODO: consider hashing an object IE `object-hash` and convert to number.
            break;

         case 'string':
            result = this.hashString(value);
            break;

         case 'symbol':
            result = this.hashString(Symbol.keyFor(value));
            break;
      }

      return result;
   }

   /**
    * @param target -
    *
    * @param Prototype -
    *
    * @returns target constructor function has Prototype.
    */
   static hasPrototype(target: any, Prototype: DynReducer.Ctor.DerivedReducer<any, any>): boolean
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
   static isIterable(data: any): data is Iterable<any>
   {
      return data !== null && data !== void 0 && typeof data === 'object' &&
       typeof data[Symbol.iterator] === 'function';
   }
}

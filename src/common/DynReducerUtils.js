export class DynReducerUtils
{
   /**
    * Checks for array equality between two arrays of numbers.
    *
    * @param {number[]} a - Array A
    *
    * @param {number[]} b - Array B
    *
    * @returns {boolean} Arrays equal
    */
   static arrayEquals(a, b)
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
    * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
    *
    * @param {*}  data - Data to verify as iterable.
    *
    * @returns {boolean} Is data iterable.
    */
   static isIterable(data)
   {
      return data !== null && data !== void 0 && typeof data === 'object' && typeof data[Symbol.iterator] === 'function';
   }
}
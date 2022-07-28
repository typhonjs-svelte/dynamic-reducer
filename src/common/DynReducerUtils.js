export class DynReducerUtils
{
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

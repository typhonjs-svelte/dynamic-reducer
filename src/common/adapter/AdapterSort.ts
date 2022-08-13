import type {
   CompareFn,
   DataSort }  from '../../types/index.js';

/**
 * Provides the storage and sequencing of a managed sort function. The sort function set may be a bespoke function or a
 * {@link DataSort} object containing an `compare`, and `subscribe` attributes; `compare` is the only required
 * attribute.
 *
 * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
 * If a subscribe function is provided the sort function can notify any updates that may change sort order and this
 * triggers an index update.
 *
 * This class forms the public API which is accessible from the `.sort` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.sort.clear();
 * dynArray.sort.set(...);
 * ```
 */
export class AdapterSort<T>
{
   #sortData: { compareFn: CompareFn<T> };

   readonly #indexUpdate: Function;

   #unsubscribe: Function;

   /**
    * @param indexUpdate - Function to update indexer.
    *
    * @param sortData - Storage for compare function.
    */
   constructor(indexUpdate: Function, sortData: { compareFn: CompareFn<T> })
   {
      this.#indexUpdate = indexUpdate;

      this.#sortData = sortData;

      Object.freeze(this);
   }

   /**
    * Clears & removes any assigned sort function and triggers an index update.
    */
   clear()
   {
      const oldCompareFn = this.#sortData.compareFn;

      this.#sortData.compareFn = null;

      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      // Only update index if an old compare function is set.
      if (typeof oldCompareFn === 'function') { this.#indexUpdate(); }
   }

   /**
    * @param data - A callback function that compares two values. Return > 0 to sort b before a;
    * < 0 to sort a before b; or 0 to keep original order of a & b.
    *
    * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
    *
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
    */
   set(data: CompareFn<T>|DataSort<T>)
   {
      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      let compareFn = void 0;
      let subscribeFn = void 0;

      switch (typeof data)
      {
         case 'function':
            compareFn = data;
            subscribeFn = data.subscribe;
            break;

         case 'object':
            // Early out if data is null / noop.
            if (data === null) { break; }

            if (typeof data.compare !== 'function')
            {
               throw new TypeError(`AdapterSort error: 'compare' attribute is not a function.`);
            }

            compareFn = data.compare;
            subscribeFn = data.compare.subscribe ?? data.subscribe;
            break;
      }

      if (typeof compareFn === 'function')
      {
         this.#sortData.compareFn = compareFn;
      }
      else
      {
         const oldCompareFn = this.#sortData.compareFn;
         this.#sortData.compareFn = null;

         // Update index if the old compare function exists.
         if (typeof oldCompareFn === 'function') { this.#indexUpdate(); }
         return;
      }

      if (typeof subscribeFn === 'function')
      {
         this.#unsubscribe = subscribeFn(this.#indexUpdate);

         // Ensure that unsubscribe is a function.
         if (typeof this.#unsubscribe !== 'function')
         {
            throw new Error(
             `AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
         }
      }
      else
      {
         // A sort function with subscriber functionality are assumed to immediately invoke the `subscribe` callback.
         // Only manually update the index if there is no subscriber functionality.
         this.#indexUpdate();
      }
   }
}

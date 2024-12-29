import type { DynReducer } from '../../types';

export class AdapterSort<T> implements DynReducer.API.Sort<T>
{
   #sortData: { compareFn: DynReducer.Data.CompareFn<T> | null };

   readonly #indexUpdate: DynReducer.Data.IndexUpdateFn;

   #unsubscribe: Function | undefined;

   constructor(indexUpdate: DynReducer.Data.IndexUpdateFn, sortData: { compareFn: DynReducer.Data.CompareFn<T> | null })
   {
      this.#indexUpdate = indexUpdate;

      this.#sortData = sortData;

      Object.freeze(this);
   }

   clear()
   {
      const oldCompareFn: DynReducer.Data.CompareFn<T> | null = this.#sortData.compareFn;

      this.#sortData.compareFn = null;

      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      // Only update index if an old compare function is set.
      if (typeof oldCompareFn === 'function') { this.#indexUpdate(true); }
   }

   set(sort: DynReducer.Data.CompareFn<T> | DynReducer.Data.Sort<T>)
   {
      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      let compareFn: DynReducer.Data.CompareFn<T>;
      let subscribeFn: ((indexUpdate: DynReducer.Data.IndexUpdateFn) => () => void) | undefined;

      switch (typeof sort)
      {
         case 'function':
            compareFn = sort;
            subscribeFn = sort.subscribe;
            break;

         case 'object':
            // Early out if sort is null / noop.
            if (sort === null) { break; }

            if (typeof sort.compare !== 'function')
            {
               throw new TypeError(`AdapterSort error: 'compare' attribute is not a function.`);
            }

            compareFn = sort.compare;
            subscribeFn = sort.compare.subscribe ?? sort.subscribe;
            break;
      }

      if (typeof compareFn! === 'function')
      {
         this.#sortData.compareFn = compareFn;
      }
      else
      {
         const oldCompareFn: DynReducer.Data.CompareFn<T> | null = this.#sortData.compareFn;
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
         this.#indexUpdate(true);
      }
   }
}

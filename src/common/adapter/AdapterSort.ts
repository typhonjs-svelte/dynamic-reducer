import type {
   IDynAdapterSort,

   DynCompareFn,
   DynDataSort,
   DynIndexerUpdateFn } from '../../types';

export class AdapterSort<T> implements IDynAdapterSort<T>
{
   #sortData: { compareFn: DynCompareFn<T> };

   readonly #indexUpdate: DynIndexerUpdateFn;

   #unsubscribe: Function;

   constructor(indexUpdate: DynIndexerUpdateFn, sortData: { compareFn: DynCompareFn<T> })
   {
      this.#indexUpdate = indexUpdate;

      this.#sortData = sortData;

      Object.freeze(this);
   }

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
      if (typeof oldCompareFn === 'function') { this.#indexUpdate(true); }
   }

   set(sort: DynCompareFn<T>|DynDataSort<T>)
   {
      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      let compareFn: DynCompareFn<T> = void 0;
      let subscribeFn: (indexUpdate: DynIndexerUpdateFn) => () => void = void 0;

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
         this.#indexUpdate(true);
      }
   }
}

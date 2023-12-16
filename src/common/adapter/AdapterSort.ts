import type {
   IDynAdapterSort,

   DynCompareFn,
   DynDataSort }  from '../../types';

export class AdapterSort<T> implements IDynAdapterSort<T>
{
   #sortData: { compareFn: DynCompareFn<T> };

   readonly #indexUpdate: Function;

   #unsubscribe: Function;

   constructor(indexUpdate: Function, sortData: { compareFn: DynCompareFn<T> })
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
      if (typeof oldCompareFn === 'function') { this.#indexUpdate(); }
   }

   set(data: DynCompareFn<T>|DynDataSort<T>)
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

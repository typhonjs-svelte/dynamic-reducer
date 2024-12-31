import type { DynReducer } from '../../types';

export class AdapterFilters<T> implements DynReducer.API.Filters<T>
{
   #filtersData: { filters: DynReducer.Data.Filter<T>[] };

   readonly #indexUpdate: DynReducer.Data.IndexUpdateFn;

   #mapUnsubscribe: Map<Function, Function> = new Map();

   constructor(indexUpdate: DynReducer.Data.IndexUpdateFn, filtersAdapter: { filters: DynReducer.Data.Filter<T>[] })
   {
      this.#indexUpdate = indexUpdate;

      this.#filtersData = filtersAdapter;

      Object.freeze(this);
   }

   get length(): number { return this.#filtersData.filters.length; }

   * [Symbol.iterator](): IterableIterator<DynReducer.Data.Filter<T>>
   {
      if (this.#filtersData.filters.length === 0) { return; }

      for (const entry of this.#filtersData.filters)
      {
         yield { ...entry };
      }
   }

   add(...filters: (DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>)[])
   {
      /**
       * Tracks the number of filters added that have subscriber functionality.
       */
      let subscribeCount: number = 0;

      for (const filter of filters)
      {
         const filterType = typeof filter;

         if (filterType !== 'function' && (filterType !== 'object' || filter === null))
         {
            throw new TypeError(`AdapterFilters error: 'filter' is not a function or object.`);
         }

         let data: DynReducer.Data.Filter<T>;
         let subscribeFn: ((indexUpdate: DynReducer.Data.IndexUpdateFn) => () => void) | undefined;

         if (filterType === 'function')
         {
            data = {
               id: void 0,
               filter: filter as DynReducer.Data.FilterFn<T>,
               weight: 1
            };

            subscribeFn = filter.subscribe;
         }
         else if (filterType === 'object')
         {
            if ('filter' in filter)
            {
               if (typeof filter.filter !== 'function')
               {
                  throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
               }

               if (filter.weight !== void 0 && (typeof filter.weight !== 'number' ||
                filter.weight < 0 || filter.weight > 1))
               {
                  throw new TypeError(
                   `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
               }

               data = {
                  id: filter.id !== void 0 ? filter.id : void 0,
                  filter: filter.filter,
                  weight: filter.weight || 1
               };

               subscribeFn = filter.filter.subscribe ?? filter.subscribe;
            }
            else
            {
               throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
            }
         /* c8 ignore next 5 */ // TS type guard for `else` conditional.
         }
         else
         {
            throw new TypeError(`AdapterFilters error: 'filter' is not defined.`);
         }

         // Find the index to insert where data.weight is less than existing values weight.
         const index: number = this.#filtersData.filters.findIndex((value): boolean =>
         {
            return data.weight! < value.weight!;
         });

         // If an index was found insert at that location.
         if (index >= 0)
         {
            this.#filtersData.filters.splice(index, 0, data);
         }
         else // push to end of filters.
         {
            this.#filtersData.filters.push(data);
         }

         if (typeof subscribeFn === 'function')
         {
            const unsubscribe = subscribeFn(this.#indexUpdate);

            // Ensure that unsubscribe is a function.
            if (typeof unsubscribe !== 'function')
            {
               throw new TypeError(
                'AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.');
            }

            // Ensure that the same filter is not subscribed to multiple times.
            if (this.#mapUnsubscribe.has(data.filter))
            {
               throw new Error(
                'AdapterFilters error: Filter added already has an unsubscribe function registered.');
            }

            this.#mapUnsubscribe.set(data.filter, unsubscribe);
            subscribeCount++;
         }
      }

      // Filters with subscriber functionality are assumed to immediately invoke the `subscribe` callback. If the
      // subscriber count is less than the amount of filters added then automatically trigger an index update manually.
      if (subscribeCount < filters.length) { this.#indexUpdate(true); }
   }

   clear()
   {
      this.#filtersData.filters.length = 0;

      // Unsubscribe from all filters with subscription support.
      for (const unsubscribe of this.#mapUnsubscribe.values())
      {
         unsubscribe();
      }

      this.#mapUnsubscribe.clear();

      this.#indexUpdate();
   }

   remove(...filters: (DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>)[])
   {
      const length = this.#filtersData.filters.length;

      if (length === 0) { return; }

      for (const data of filters)
      {
         // Handle the case that the filter may either be a function or a filter entry / object.
         const actualFilter = typeof data === 'function' ? data : data !== null && typeof data === 'object' ?
          data.filter : void 0;

         if (!actualFilter) { continue; }

         for (let cntr = this.#filtersData.filters.length; --cntr >= 0;)
         {
            if (this.#filtersData.filters[cntr].filter === actualFilter)
            {
               this.#filtersData.filters.splice(cntr, 1);

               // Invoke any unsubscribe function for given filter then remove from tracking.
               let unsubscribe: Function | undefined;
               if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === 'function')
               {
                  unsubscribe();
                  this.#mapUnsubscribe.delete(actualFilter);
               }
            }
         }
      }

      // Update the index a filter was removed.
      if (length !== this.#filtersData.filters.length) { this.#indexUpdate(true); }
   }

   removeBy(callback: (id: any, filter: DynReducer.Data.FilterFn<T>, weight: number) => boolean)
   {
      const length = this.#filtersData.filters.length;

      if (length === 0) { return; }

      if (typeof callback !== 'function')
      {
         throw new TypeError(`AdapterFilters error: 'callback' is not a function.`);
      }

      this.#filtersData.filters = this.#filtersData.filters.filter((data) =>
      {
         const remove = callback.call(callback, { ...data });

         if (remove)
         {
            let unsubscribe: Function | undefined;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         // Reverse remove boolean to properly filter / remove this filter.
         return !remove;
      });

      if (length !== this.#filtersData.filters.length) { this.#indexUpdate(true); }
   }

   removeById(...ids: any[])
   {
      const length = this.#filtersData.filters.length;

      if (length === 0) { return; }

      this.#filtersData.filters = this.#filtersData.filters.filter((data) =>
      {
         let remove = 0;

         for (const id of ids) { remove |= (data.id === id ? 1 : 0); }

         // If not keeping invoke any unsubscribe function for given filter then remove from tracking.
         if (!!remove)
         {
            let unsubscribe: Function | undefined;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         return !remove; // Swap here to actually remove the item via array filter method.
      });

      if (length !== this.#filtersData.filters.length) { this.#indexUpdate(true); }
   }
}

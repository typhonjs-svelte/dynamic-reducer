import type {
   DataFilter,
   FilterFn }  from '../../types/index.js';

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link DataFilter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
 * attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers. This
 * allows filters to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always runs
 * before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter with a
 * lower weight; an example of this is a keyword / name that will filter out many entries making any further filtering
 * faster. If no weight is specified the default of '1' is assigned and it is appended to the end of the filters list.
 *
 * This class forms the public API which is accessible from the `.filters` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 */
export class AdapterFilters<T>
{
   #filtersData: { filters: DataFilter<T>[] };

   readonly #indexUpdate: Function;

   #mapUnsubscribe: Map<Function, Function> = new Map();

   /**
    * @param indexUpdate - update function for the indexer.
    *
    * @param filtersAdapter - Stores the filter function data.
    */
   constructor(indexUpdate, filtersAdapter: { filters: DataFilter<T>[] })
   {
      this.#indexUpdate = indexUpdate;

      this.#filtersData = filtersAdapter;

      Object.freeze(this);
   }

   /**
    * @returns Returns the length of the filter data.
    */
   get length(): number { return this.#filtersData.filters.length; }

   /**
    * Provides an iterator for filters.
    *
    * @returns Generator / iterator of filters.
    * @yields {DataFilter<T>}
    */
   *[Symbol.iterator](): Generator<DataFilter<T>, DataFilter<T>, DataFilter<T>> | void
   {
      if (this.#filtersData.filters.length === 0) { return; }

      for (const entry of this.#filtersData.filters)
      {
         yield { ...entry };
      }
   }

   /**
    * @param filters -
    */
   add(...filters: (FilterFn<T>|DataFilter<T>)[])
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

         let data = void 0;
         let subscribeFn = void 0;

         if (filterType === 'function')
         {
            data = {
               id: void 0,
               filter,
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

               if (filter.weight !== void 0 && typeof filter.weight !== 'number' ||
                   (filter.weight < 0 || filter.weight > 1))
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
         }

         // Find the index to insert where data.weight is less than existing values weight.
         const index = this.#filtersData.filters.findIndex((value) =>
         {
            return data.weight < value.weight;
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
      if (subscribeCount < filters.length) { this.#indexUpdate(); }
   }

   /**
    * Clears and removes all filters.
    */
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

   /**
    * @param filters -
    */
   remove(...filters: (FilterFn<T>|DataFilter<T>)[])
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
               let unsubscribe = void 0;
               if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === 'function')
               {
                  unsubscribe();
                  this.#mapUnsubscribe.delete(actualFilter);
               }
            }
         }
      }

      // Update the index a filter was removed.
      if (length !== this.#filtersData.filters.length) { this.#indexUpdate(); }
   }

   /**
    * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
    * Any truthy value returned will remove that filter.
    *
    * @param callback - Callback function to evaluate each filter entry.
    */
   removeBy(callback: (id: any, filter: FilterFn<T>, weight: number) => boolean)
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
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         // Reverse remove boolean to properly filter / remove this filter.
         return !remove;
      });

      if (length !== this.#filtersData.filters.length) { this.#indexUpdate(); }
   }

   /**
    * @param ids - Removes filters by ID.
    */
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
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         return !remove; // Swap here to actually remove the item via array filter method.
      });

      if (length !== this.#filtersData.filters.length) { this.#indexUpdate(); }
   }
}

import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DerivedAPI,
   DynReducerUtils,
   IndexerAPI }                     from '#common';

import { ArrayIndexer }             from './ArrayIndexer';

import { DynArrayReducerDerived }   from './derived/DynArrayReducerDerived';

import type { DynReducer }          from '../types';

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
export class DynArrayReducer<T>
{
   #array: DynReducer.Data.Host<T[]> = [null];

   readonly #derived: AdapterDerived<T[], number, T>;

   readonly #derivedPublicAPI: DerivedAPI<T[], number, T>;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DynReducer.Data.Filter<T>[] } = { filters: [] };

   readonly #index: ArrayIndexer<T>;

   readonly #indexPublicAPI: IndexerAPI<number, T>;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: DynReducer.Data.CompareFn<T> | null } = { compareFn: null };

   #subscriptions: Function[] = [];

   #destroyed: boolean = false;

   /**
    * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
    * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
    *
    * @param [data] - Data iterable to store if array or copy otherwise.
    */
   constructor(data?: Iterable<T> | DynReducer.Options.ArrayReducer<T>)
   {
      let dataIterable: Iterable<T> | undefined;
      let filters: Iterable<DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>> | undefined;
      let sort: DynReducer.Data.CompareFn<T> | DynReducer.Data.Sort<T> | undefined;

      if (data === null)
      {
         throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
      }

      if (data !== void 0 && typeof data !== 'object' && !DynReducerUtils.isIterable(data))
      {
         throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
      }

      if (data !== void 0 && Symbol.iterator in (data as Iterable<T>))
      {
         dataIterable = data as Iterable<T>;
      }
      else if (data !== void 0 && ('data' in data || 'filters' in data || 'sort' in data))
      {
         if (data.data !== void 0 && !DynReducerUtils.isIterable(data.data))
         {
            throw new TypeError(`DynArrayReducer error (DataDynArray): 'data' attribute is not iterable.`);
         }

         dataIterable = data.data;

         if (data.filters !== void 0)
         {
            if (DynReducerUtils.isIterable(data.filters))
            {
               filters = data.filters;
            }
            else
            {
               throw new TypeError(`DynArrayReducer error (DataDynArray): 'filters' attribute is not iterable.`);
            }
         }

         if (data.sort !== void 0)
         {
            if (typeof data.sort === 'function')
            {
               sort = data.sort;
            }
            else if (typeof data.sort === 'object' && data.sort !== null)
            {
               sort = data.sort;
            }
            else
            {
               throw new TypeError(
                `DynArrayReducer error (DataDynArray): 'sort' attribute is not a function or object.`);
            }
         }
      }

      // In the case of the main data being an array directly use the array otherwise create a copy.
      if (dataIterable)
      {
         this.#array[0] = Array.isArray(dataIterable) ? dataIterable : [...dataIterable];
      }

      this.#index = new ArrayIndexer(this.#array, this.#updateSubscribers.bind(this));
      this.#indexPublicAPI = new IndexerAPI<number, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DynArrayReducerDerived);
      this.#derivedPublicAPI = new DerivedAPI<T[], number, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      // Add any filters and sort function defined by DataDynArray.
      if (filters) { this.filters.add(...filters); }
      if (sort) { this.sort.set(sort); }
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
    * performed to the data externally do invoke `update` via {@link DynArrayReducer.index} with `true` to recalculate
    * the index and notify all subscribers.
    *
    * @returns The internal data.
    */
   get data(): T[] | null { return this.#array[0]; }

   /**
    * @returns Derived public API.
    */
   get derived(): DynReducer.API.Derived<number, T> { return this.#derivedPublicAPI; }

   /**
    * @returns The filters adapter.
    */
   get filters(): DynReducer.API.Filters<T> { return this.#filters; }

   /**
    * @returns Returns the Indexer public API; is also iterable.
    */
   get index(): DynReducer.API.Index<number, T> { return this.#indexPublicAPI; }

   /**
    * @returns Returns whether this instance is destroyed.
    */
   get destroyed(): boolean { return this.#destroyed; }

   /**
    * @returns Returns the main data items or indexed items length.
    */
   get length(): number
   {
      const array = this.#array[0];
      return this.#index.active ? this.#indexPublicAPI.length :
       array ? array.length : 0;
   }

   /**
    * @returns Returns current reversed state.
    */
   get reversed(): boolean { return this.#index.indexData.reversed; }

   /**
    * @returns The sort adapter.
    */
   get sort(): DynReducer.API.Sort<T> { return this.#sort; }

   /**
    * Sets reversed state and notifies subscribers.
    *
    * @param reversed - New reversed state.
    */
   set reversed(reversed: boolean)
   {
      if (typeof reversed !== 'boolean')
      {
         throw new TypeError(`DynArrayReducer.reversed error: 'reversed' is not a boolean.`);
      }

      this.#index.indexData.reversed = reversed;

      // Recalculate index and force an update to any subscribers.
      this.index.update(true);
   }

   /**
    * Removes all derived reducers, subscriptions, and cleans up all resources.
    */
   destroy()
   {
      if (this.#destroyed) { return; }

      this.#destroyed = true;
      this.#derived.destroy();

      // Set the backing data to null and provide a final update.
      this.#array = [null];
      this.index.update(true);

      // Remove all subscriptions.
      this.#subscriptions.length = 0;

      this.#index.destroy();
      this.#filters.clear();
      this.#sort.clear();
   }

   /**
    * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
    * `replace` is set to true.
    *
    * @param data - New data to set to internal data.
    *
    * @param [replace=false] - New data to set to internal data.
    */
   setData(data: T[] | Iterable<T> | null, replace: boolean = false)
   {
      if (data !== null && !DynReducerUtils.isIterable(data))
      {
         throw new TypeError(`DynArrayReducer.setData error: 'data' is not iterable.`);
      }

      if (typeof replace !== 'boolean')
      {
         throw new TypeError(`DynArrayReducer.setData error: 'replace' is not a boolean.`);
      }

      const array = this.#array[0];

      // If the array isn't defined or 'replace' is true then replace internal data with new array or create an array
      // from an iterable.
      if (!Array.isArray(array) || replace)
      {
         if (data)
         {
            this.#array[0] = Array.isArray(data) ? data : [...data];
         }
      }
      else
      {
         if (data)
         {
            // Remove all entries in internal data. This will not replace any initially set array.
            array.length = 0;

            // Add all new data.
            array.push(...data);
         }
         else
         {
            this.#array[0] = null;
         }
      }

      // Force clear the index and always rebuild.
      this.#index.indexData.index = null;

      // Recalculate index and force an update to any subscribers.
      this.index.update(true);
   }

   /**
    * Add a subscriber to this DynArrayReducer instance.
    *
    * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: (value: DynArrayReducer<T>) => void): () => void
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this);                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    * Updates subscribers on changes.
    */
   #updateSubscribers()
   {
      for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](this); }
   }

   /**
    * Provides an iterator for data stored in DynArrayReducer.
    *
    * @returns Iterator for data stored in DynArrayReducer.
    */
   * [Symbol.iterator](): IterableIterator<T>
   {
      const array = this.#array[0];

      if (this.#destroyed || array === null || array?.length === 0) { return; }

      if (this.#index.active)
      {
         for (const entry of this.index) { yield array[entry]; }
      }
      else
      {
         if (this.reversed)
         {
            for (let cntr = array.length; --cntr >= 0;) { yield array[cntr]; }
         }
         else
         {
            for (let cntr = 0; cntr < array.length; cntr++) { yield array[cntr]; }
         }
      }
   }
}

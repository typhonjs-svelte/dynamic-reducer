import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DerivedAPI,
   DynReducerUtils,
   IndexerAPI }               from '../common/index.js';

import { Indexer }            from './Indexer.js';

import type {
   DynCompareFn,
   DynMapData,
   DynDataFilter,
   DynDataHost,
   DynDataSort,
   DynFilterFn }                 from '../types/index.js';

import { DynMapReducerDerived }  from './derived/DynMapReducerDerived.js';

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
export class DynMapReducer<K, T>
{
   #map: DynDataHost<Map<K, T>> = [null];

   readonly #derived: AdapterDerived<Map<K, T>, K, T>;

   readonly #derivedPublicAPI: DerivedAPI<Map<K, T>, K, T>;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DynDataFilter<T>[] } = { filters: [] };

   readonly #index: Indexer<K, T>;

   readonly #indexPublicAPI: IndexerAPI<K, T>;

   #reversed: boolean = false;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: DynCompareFn<T> } = { compareFn: null };

   #subscriptions = [];

   #destroyed = false;

   /**
    * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
    * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
    *
    * @param [data] - Data iterable to store if array or copy otherwise.
    */
   constructor(data?: Map<K, T> | DynMapData<K, T>)
   {
      let dataMap: Map<K, T> = void 0;
      let filters: Iterable<DynFilterFn<T> | DynDataFilter<T>> = void 0;
      let sort: DynCompareFn<T> | DynDataSort<T> = void 0;

      if (data === null)
      {
         throw new TypeError(`DynMapReducer error: 'data' is not an object or Map.`);
      }

      if (data !== void 0 && typeof data !== 'object' && !(data as any instanceof Map))
      {
         throw new TypeError(`DynMapReducer error: 'data' is not an object or Map.`);
      }

      if (data !== void 0 && data instanceof Map)
      {
         dataMap = data;
      }
      else if (data !== void 0 && ('data' in data || 'filters' in data || 'sort' in data))
      {
         if (data.data !== void 0 && !(data.data instanceof Map))
         {
            throw new TypeError(`DynMapReducer error (DataDynMap): 'data' attribute is not a Map.`);
         }

         dataMap = data.data;

         if (data.filters !== void 0)
         {
            if (DynReducerUtils.isIterable(data.filters))
            {
               filters = data.filters;
            }
            else
            {
               throw new TypeError(`DynMapReducer error (DataDynMap): 'filters' attribute is not iterable.`);
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
                `DynMapReducer error (DataDynMap): 'sort' attribute is not a function or object.`);
            }
         }
      }

      // In the case of the main data being an array directly use the array otherwise create a copy.
      if (dataMap)
      {
         this.#map[0] = dataMap;
      }

      this.#index = new Indexer(this.#map, this.#updateSubscribers.bind(this));
      this.#indexPublicAPI = new IndexerAPI<K, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
      this.#derivedPublicAPI = new DerivedAPI<Map<K, T>, K, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      // Add any filters and sort function defined by DataDynMap.
      if (filters) { this.filters.add(...filters); }
      if (sort) { this.sort.set(sort); }

      // Invoke an custom initialization for child classes.
      this.initialize();
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: When a map is set as data then that map is used as the internal data. If any changes are
    * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
    * index and notify all subscribers.
    *
    * @returns The internal data.
    */
   get data(): Map<K, T> | null { return this.#map[0]; }

   /**
    * @returns Derived public API.
    */
   get derived(): DerivedAPI<Map<K, T>, K, T> { return this.#derivedPublicAPI; }

   /**
    * @returns The filters adapter.
    */
   get filters(): AdapterFilters<T> { return this.#filters; }

   /**
    * @returns Returns the Indexer public API.
    */
   get index(): IndexerAPI<K, T> { return this.#indexPublicAPI; }

   /**
    * Returns whether this instance is destroyed.
    */
   get destroyed(): boolean { return this.#destroyed; }

   /**
    * Gets the main data / items length.
    *
    * @returns {number} Main data / items length.
    */
   get length()
   {
      const map = this.#map[0];
      return this.#index.active ? this.#indexPublicAPI.length :
       map ? map.size : 0;
   }

   /**
    * Gets current reversed state.
    *
    * @returns {boolean} Reversed state.
    */
   get reversed() { return this.#reversed; }

   /**
    * @returns The sort adapter.
    */
   get sort(): AdapterSort<T> { return this.#sort; }

   /**
    * Sets reversed state and notifies subscribers.
    *
    * @param reversed - New reversed state.
    */
   set reversed(reversed: boolean)
   {
      if (typeof reversed !== 'boolean')
      {
         throw new TypeError(`DynMapReducer.reversed error: 'reversed' is not a boolean.`);
      }

      this.#reversed = reversed;
      this.#index.reversed = reversed;

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
      this.#map = [null];
      this.index.update(true);

      // Remove all subscriptions.
      this.#subscriptions.length = 0;

      this.#index.destroy();
      this.#filters.clear();
      this.#sort.clear();
   }

   /**
    * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
    * child classes to avoid implementing the constructor.
    *
    * @protected
    */
   initialize() {}

   /**
    * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
    * `replace` is set to true.
    *
    * @param data - New data to set to internal data.
    *
    * @param replace=false - New data to set to internal data.
    */
   setData(data: Map<K, T> | null, replace: boolean = false)
   {
      if (data !== null && !(data instanceof Map))
      {
         throw new TypeError(`DynMapReducer.setData error: 'data' is not iterable.`);
      }

      if (typeof replace !== 'boolean')
      {
         throw new TypeError(`DynMapReducer.setData error: 'replace' is not a boolean.`);
      }

      const map = this.#map[0];

      // If the array isn't defined or 'replace' is true then replace internal data with new array or create an array
      // from an iterable.
      if (!(map instanceof Map) || replace)
      {
         this.#map[0] = data instanceof Map ? data : null;
      }
      else if (data instanceof Map && map instanceof Map)
      {
         // Create a set of all current entry IDs.
         const removeKeySet = new Set(map.keys());

         for (const key of data.keys())
         {
            map.set(key, data.get(key));

            if (removeKeySet.has(key)) { removeKeySet.delete(key); }
         }

         // Remove entries that are no longer in data.
         for (const key of removeKeySet) { map.delete(key); }
      }
      else if (data === null)
      {
         this.#map[0] = null;
      }

      // Recalculate index and force an update to any subscribers.
      this.index.update(true);
   }

   /**
    * Add a subscriber to this DynMapReducer instance.
    *
    * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: (value: DynMapReducer<K, T>) => void): () => void
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
    * Provides an iterator for data stored in DynMapReducer.
    *
    * @yields {T}
    */
   *[Symbol.iterator](): IterableIterator<T>
   {
      const map = this.#map[0];

      if (this.#destroyed || map === null || map?.size === 0) { return; }

      if (this.#index.active)
      {
         for (const key of this.index) { yield map.get(key); }
      }
      else
      {
         if (this.reversed)
         {
            // TODO: Not efficient due to creating temporary values array.
            const values = [...map.values()];
            for (let cntr = values.length; --cntr >= 0;) { yield values[cntr]; }
         }
         else
         {
            for (const value of map.values()) { yield value; }
         }
      }
   }
}

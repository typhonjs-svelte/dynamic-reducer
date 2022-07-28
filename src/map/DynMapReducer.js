import {
   AdapterFilters,
   AdapterSort,
   DynReducerUtils } from '#common';

import { Indexer }   from './Indexer.js';

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template K
 * @template T
 */
export class DynMapReducer
{
   /** @type {Map<K, T>|null[]} */
   #map = [null];

   /**
    * @type {Indexer}
    */
   #index;

   /**
    * @type{IndexerAPI<K>}
    */
   #indexPublicAPI;

   /**
    * @type {AdapterFilters<T>}
    */
   #filters;

   /**
    * @type {{filters: FilterFn<T>[]}}
    */
   #filtersAdapter;

   /**
    * @type {boolean}
    */
   #reversed = false;

   /**
    * @type {AdapterSort<T>}
    */
   #sort;

   /**
    * @type {{compareFn: CompareFn<T>}}
    */
   #sortAdapter;

   #subscriptions = [];

   /**
    * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is a Map it
    * will be used as the host map and not copied.
    *
    * @param {Map<K, T>|DynMapData<T>}   [data] - Source map.
    */
   constructor(data)
   {
      let dataMap = void 0;
      let filters = void 0;
      let sort = void 0;

      // Potentially working with DynMapData.
      if (!(data instanceof Map) && data !== null && typeof data === 'object')
      {
         if (data.data !== void 0 && !(data.data instanceof Map))
         {
            throw new TypeError(`DynMapReducer error (DynMapData): 'data' attribute is not a Map.`);
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
               throw new TypeError(`DynMapReducer error (DynMapData): 'filters' attribute is not iterable.`);
            }
         }

         if (data.sort !== void 0)
         {
            if (typeof data.sort === 'function')
            {
               sort = data.sort;
            }
            else
            {
               throw new TypeError(`DynMapReducer error (DynMapData): 'sort' attribute is not a function.`);
            }
         }
      }
      else
      {
         if (data !== void 0 && !(data instanceof Map))
         {
            throw new TypeError(`DynMapReducer error: 'data' is not a Map.`);
         }

         dataMap = data;
      }

      // In the case of the main data being an array directly use the array otherwise create a copy.
      this.#map[0] = dataMap instanceof Map ? dataMap : null;

      [this.#index, this.#indexPublicAPI] = new Indexer(this.#map, this.#updateSubscribers.bind(this));

      [this.#filters, this.#filtersAdapter] = new AdapterFilters(this.#indexPublicAPI.update);
      [this.#sort, this.#sortAdapter] = new AdapterSort(this.#indexPublicAPI.update);

      this.#index.initAdapters(this.#filtersAdapter, this.#sortAdapter);

      // Add any filters and sort function defined by DynMapData.
      if (filters) { this.filters.add(...filters); }
      if (sort) { this.sort.set(sort); }
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * TODO: UPDATE
    * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
    * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
    * all subscribers.
    *
    * @returns {Map<K, T>|null} The internal data.
    */
   get data() { return this.#map[0]; }

   /**
    * @returns {AdapterFilters<T>} The filters adapter.
    */
   get filters() { return this.#filters; }

   /**
    * Returns the Indexer public API.
    *
    * @returns {IndexerAPI<K>} Indexer API - is also iterable.
    */
   get index() { return this.#indexPublicAPI; }

   /**
    * Gets the main data map length / size.
    *
    * @returns {number} Main data map length / size.
    */
   get length()
   {
      const map = this.#map[0];
      return map ? map.size : 0;
   }

   /**
    * Gets current reversed state.
    *
    * @returns {boolean} Reversed state.
    */
   get reversed() { return this.#reversed; }

   /**
    * @returns {AdapterSort<T>} The sort adapter.
    */
   get sort() { return this.#sort; }

   /**
    * Sets reversed state and notifies subscribers.
    *
    * @param {boolean} reversed - New reversed state.
    */
   set reversed(reversed)
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
    * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
    * `replace` is set to true.
    *
    * @param {Map<K, T> | null} data - New data to set to internal data.
    *
    * @param {boolean} [replace=false] - New data to set to internal data.
    */
   setData(data, replace = false)
   {
      if (data !== null && !(data instanceof Map))
      {
         throw new TypeError(`DynMapReducer.setData error: 'data' is not a Map.`);
      }

      if (typeof replace !== 'boolean')
      {
         throw new TypeError(`DynMapReducer.setData error: 'replace' is not a boolean.`);
      }

      const map = this.#map[0];

      // Replace internal data with new Map or create an array from an iterable.
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
            if (removeKeySet.has(key))
            {
               map.set(key, data.get(key));
               removeKeySet.delete(key);
            }
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
    *
    * @param {function(DynMapReducer<T>): void} handler - Callback function that is invoked on update / changes.
    *                                                       Receives `this` reference.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
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
    *
    */
   #updateSubscribers()
   {
      for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](this); }
   }

   /**
    * Provides an iterator for data stored in DynMapReducer.
    *
    * @returns {Generator<*, T, *>} Generator / iterator of all data.
    * @yields {T}
    */
   *[Symbol.iterator]()
   {
      const map = this.#map[0];

      if (map === null || map?.size === 0) { return; }

      if (this.#index.isActive())
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

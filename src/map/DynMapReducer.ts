import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DynReducerUtils,
   IndexerAPI }                  from '#common';

import { MapIndexer }            from './MapIndexer';

import { DerivedMapAPI }         from './derived/DerivedMapAPI';
import { DynMapReducerDerived }  from './derived/DynMapReducerDerived';

import type { DynReducer }       from '../types';
import type { Internal }         from '../types/internal';

/**
 * Provides a managed {@link Map} with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support allowing for a {@link Map} to be treated like an iterable list.
 *
 * _Note:_
 * - The default type `unknown` ensures stricter type checking, preventing unintended operations on the data.
 * - If the type of data is known, explicitly specify the generic type to improve clarity and maintainability:
 *
 * @example
 * ```ts
 * const mapReducer = new DynMapReducer<number, string>(
 *     new Map([
 *         [1, 'banana'],
 *         [2, 'apple'],
 *         [3, 'cherry'],
 *     ])
 * );
 *
 * console.log([...mapReducer]); // Output: ['banana', 'apple', 'cherry']
 *
 * // Sort values alphabetically.
 * mapReducer.sort.set((a, b) => a.localeCompare(b));
 *
 * console.log([...mapReducer]); // Output: ['apple', 'banana', 'cherry']
 * ```
 *
 * @typeParam K `unknown` - Key type. Defaults to `unknown` to enforce type safety when no type is specified.
 *
 * @typeParam T `unknown` - Type of data. Defaults to `unknown` to enforce type safety when no type is specified.
 */
export class DynMapReducer<K = unknown, T = unknown>
{
   #map: Internal.Data.Host<Map<K, T>> = [null];

   readonly #derived: AdapterDerived<Map<K, T>, K, T>;

   readonly #derivedPublicAPI: DynReducer.API.DerivedMap<K, T>;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DynReducer.Data.Filter<T>[] } = { filters: [] };

   readonly #index: MapIndexer<K, T>;

   readonly #indexPublicAPI: IndexerAPI<K, T>;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: DynReducer.Data.CompareFn<T> | null } = { compareFn: null };

   #subscribers: Function[] = [];

   #destroyed = false;

   /**
    * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
    * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
    *
    * @param [data] - Data iterable to store if array or copy otherwise.
    *
    * @typeParam K `unknown` - Key type.
    *
    * @typeParam T `unknown` - Type of data.
    */
   constructor(data?: Map<K, T> | DynReducer.Options.MapReducer<K, T>)
   {
      let dataMap: Map<K, T> | undefined;
      let filters: Iterable<DynReducer.Data.FilterFn<T> | DynReducer.Data.Filter<T>> | undefined;
      let sort: DynReducer.Data.CompareFn<T> | DynReducer.Data.Sort<T> | undefined;

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

         if (data.data instanceof Map)
         {
            dataMap = data.data;
         }

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

      this.#index = new MapIndexer(this.#map, this.#updateSubscribers.bind(this));
      this.#indexPublicAPI = new IndexerAPI<K, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
      this.#derivedPublicAPI = new DerivedMapAPI<Map<K, T>, K, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      // Add any filters and sort function defined by DataDynMap.
      if (filters) { this.filters.add(...filters); }
      if (sort) { this.sort.set(sort); }
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: When a map is set as data then that map is used as the internal data. If any changes are performed to the
    * data externally do invoke `update` via {@link DynMapReducer.index} with `true` to recalculate the  index and
    * notify all subscribers.
    *
    * @returns The internal data.
    */
   get data(): Map<K, T> | null { return this.#map[0]; }

   /**
    * @returns Derived public API.
    */
   get derived(): DynReducer.API.DerivedMap<K, T> { return this.#derivedPublicAPI; }

   /**
    * @returns The filters adapter.
    */
   get filters(): DynReducer.API.Filters<T> { return this.#filters; }

   /**
    * @returns Returns the Indexer public API; is also iterable.
    */
   get index(): DynReducer.API.Index<K> { return this.#indexPublicAPI; }

   /**
    * @returns Returns whether this instance is destroyed.
    */
   get destroyed(): boolean { return this.#destroyed; }

   /**
    * @returns Returns the main data items or indexed items length.
    */
   get length(): number
   {
      const map = this.#map[0];
      return this.#index.active ? this.#indexPublicAPI.length :
       map ? map.size : 0;
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
         throw new TypeError(`DynMapReducer.reversed error: 'reversed' is not a boolean.`);
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
      this.#map = [null];
      this.index.update(true);

      // Remove all subscriptions.
      this.#subscribers.length = 0;

      this.#filters.clear();
      this.#sort.clear();
      this.#index.destroy();
   }

   /**
    * Provides a callback for custom reducers to initialize any data / custom configuration. Depending on the consumer
    * of `dynamic-reducer` this may be utilized allowing child classes to avoid implementing the constructor.
    *
    * @param [optionsRest] - Any additional custom options passed beyond {@link DynReducer.Options.Common}.
    *
    * @protected
    */
   /* c8 ignore next */
   protected initialize(optionsRest?: { [key: string]: any }): void {}

   /**
    * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
    * `replace` is set to true.
    *
    * @param data - New data to set to internal data.
    *
    * @param [replace=false] - New data to set to internal data.
    */
   setData(data: Map<K, T> | null, replace: boolean = false): void
   {
      if (data !== null && !(data instanceof Map))
      {
         throw new TypeError(`DynMapReducer.setData error: 'data' is not iterable.`);
      }

      if (typeof replace !== 'boolean')
      {
         throw new TypeError(`DynMapReducer.setData error: 'replace' is not a boolean.`);
      }

      const map: Map<K, T> | null = this.#map[0];

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
            map.set(key, data.get(key)!);

            if (removeKeySet.has(key)) { removeKeySet.delete(key); }
         }

         // Remove entries that are no longer in data.
         for (const key of removeKeySet) { map.delete(key); }
      }
      else if (data === null)
      {
         this.#map[0] = null;
      }

      // Force clear the index and always rebuild.
      this.#index.indexData.index = null;

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
   subscribe(handler: (value: this) => void): () => void
   {
      const currentIdx: number = this.#subscribers.findIndex((entry: Function): boolean => entry === handler);
      if (currentIdx === -1)
      {
         this.#subscribers.push(handler);
         handler(this);                     // call handler with current value
      }

      // Return unsubscribe function.
      return (): void =>
      {
         const existingIdx: number = this.#subscribers.findIndex((entry: Function): boolean => entry === handler);
         if (existingIdx !== -1) { this.#subscribers.splice(existingIdx, 1); }
      }
   }

   /**
    * Updates subscribers on changes.
    */
   #updateSubscribers()
   {
      for (let cntr: number = 0; cntr < this.#subscribers.length; cntr++) { this.#subscribers[cntr](this); }
   }

   /**
    * Provides an iterator for data stored in DynMapReducer.
    *
    * @returns Iterator for data stored in DynMapReducer.
    */
   * [Symbol.iterator](): IterableIterator<T>
   {
      const map = this.#map[0];

      if (this.#destroyed || map === null || map?.size === 0) { return; }

      if (this.#index.active)
      {
         for (const key of this.index) { yield map.get(key)!; }
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

import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DerivedAPI,
   DynReducerUtils,
   IndexerAPI }      from '../../common';

import { MapIndexer }   from '../MapIndexer';

import type {
   DynAdapterFilters,
   DynAdapterSort,
   DynDerivedAPI,
   DynDerivedReducer,
   DynIndexerAPI,

   DynCompareFn,
   DynDataOptions,
   DynDataFilter,
   DynDataHost,
   DynDataSort,
   DynFilterFn }        from '../../types';

/**
 * Provides the base implementation derived reducer for Maps / DynMapReducer.
 *
 * Note: That you should never directly create an instance of a derived reducer, but instead use the
 * {@link DynMapReducerDerived.initialize} callback to set up any initial state in a custom derived reducer.
 *
 * @template K, T
 */
export class DynMapReducerDerived<K, T> implements DynDerivedReducer<Map<K, T>, K, T>
{
   #map: DynDataHost<Map<K, T>>;

   readonly #derived: AdapterDerived<Map<K, T>, K, T>;

   readonly #derivedPublicAPI: DynDerivedAPI<Map<K, T>, K, T>;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DynDataFilter<T>[] } = { filters: [] };

   readonly #index: MapIndexer<K, T>;

   readonly #indexPublicAPI: IndexerAPI<K, T>;

   #reversed: boolean = false;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: DynCompareFn<T> } = { compareFn: null };

   #subscriptions: Function[] = [];

   #destroyed = false;

   /**
    * @param {DynDataHost<Map<K, T>>}  map - Data host Map.
    *
    * @param {DynIndexerAPI<K, T>}    parentIndex - Parent indexer.
    *
    * @param {DynDataOptions<T>}       options - Any filters and sort functions to apply.
    */
   constructor(map: DynDataHost<Map<K, T>>, parentIndex: DynIndexerAPI<K, T>, options: DynDataOptions<T>)
   {
      this.#map = map;

      this.#index = new MapIndexer(this.#map, this.#updateSubscribers.bind(this), parentIndex);
      this.#indexPublicAPI = new IndexerAPI<K, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
      this.#derivedPublicAPI = new DerivedAPI<Map<K, T>, K, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      const { filters, sort, ...optionsRest } = options;

      if (filters !== void 0)
      {
         if (!DynReducerUtils.isIterable(filters))
         {
            throw new TypeError(
             `DerivedMapReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
         }

         this.filters.add(...filters);
      }

      if (sort !== void 0)
      {
         if (typeof sort !== 'function' && (typeof sort !== 'object' || sort === null))
         {
            throw new TypeError(
             `DerivedMapReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
         }

         this.sort.set(sort);
      }

      // Invoke custom initialization for child classes.
      this.initialize(optionsRest);
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: The returned map is the same map set by the main reducer. If any changes are performed to the data
    * externally do invoke {@link DynIndexerAPI.update} with `true` to recalculate the index and notify all
    * subscribers.
    *
    * @returns The internal data.
    */
   get data(): Map<K, T> | null { return this.#map[0]; }

   /**
    * @returns Derived public API.
    */
   get derived(): DynDerivedAPI<Map<K, T>, K, T> { return this.#derivedPublicAPI; }

   /**
    * @returns The filters adapter.
    */
   get filters(): DynAdapterFilters<T> { return this.#filters; }

   /**
    * Returns the Indexer public API.
    *
    * @returns Indexer API - is also iterable.
    */
   get index(): DynIndexerAPI<K, T> { return this.#indexPublicAPI; }

   /**
    * Returns whether this derived reducer is destroyed.
    */
   get destroyed(): boolean { return this.#destroyed; }

   /**
    * @returns Main data / items length or indexed length.
    */
   get length(): number
   {
      const map = this.#map[0];

      return this.#index.active ? this.index.length :
       map ? map.size : 0;
   }

   /**
    * @returns Gets current reversed state.
    */
   get reversed(): boolean { return this.#reversed; }

   /**
    * @returns The sort adapter.
    */
   get sort(): DynAdapterSort<T> { return this.#sort; }

   /**
    * Sets reversed state and notifies subscribers.
    *
    * @param reversed - New reversed state.
    */
   set reversed(reversed: boolean)
   {
      if (typeof reversed !== 'boolean')
      {
         throw new TypeError(`DerivedMapReducer.reversed error: 'reversed' is not a boolean.`);
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
      this.#destroyed = true;

      // Remove any external data reference and perform a final update.
      this.#map = [null];
      this.#index.update(true);

      // Remove all subscriptions.
      this.#subscriptions.length = 0;

      this.#derived.destroy();
      this.#index.destroy();
      this.#filters.clear();
      this.#sort.clear();
   }

   /**
    * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
    * child classes to avoid implementing the constructor.
    *
    * @param [optionsRest] - Any additional custom options passed beyond {@link DynDataOptions}.
    *
    * @protected
    */
   initialize(optionsRest?: { [key: string]: any }): void {}

   /**
    * Provides an iterator for data stored in DerivedMapReducer.
    *
    * @returns {IterableIterator<T>}
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

// -------------------------------------------------------------------------------------------------------------------

   /**
    * Subscribe to this DerivedMapReducer.
    *
    * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: (value: DynMapReducerDerived<K, T>) => void): () => void
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
}

import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DynReducerUtils,
   IndexerAPI }            from '#common';

import { MapIndexer }      from '../MapIndexer';

import { DerivedMapAPI }   from './DerivedMapAPI';

import type { DynReducer } from '../../types';
import type { Internal }   from '../../types/internal';

/**
 * Provides the base implementation derived reducer for Maps / DynMapReducer.
 *
 * Note: That you should never directly create an instance of a derived reducer, but instead use the
 * {@link DynMapReducerDerived.initialize} function to set up any initial state in a custom derived reducer.
 *
 * @typeParam K `unknown` - Key type. Defaults to `unknown` to enforce type safety when no type is specified.
 *
 * @typeParam T `unknown` - Type of data. Defaults to `unknown` to enforce type safety when no type is specified.
 */
export class DynMapReducerDerived<K = unknown, T = unknown> implements DynReducer.DerivedMap<K, T>
{
   #map: Internal.Data.Host<Map<K, T>> | null;

   readonly #derived: AdapterDerived<Map<K, T>, K, T>;

   readonly #derivedPublicAPI: DynReducer.API.DerivedMap<K, T>;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DynReducer.Data.Filter<T>[] } = { filters: [] };

   readonly #index: MapIndexer<K, T>;

   readonly #indexPublicAPI: IndexerAPI<K, T>;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: DynReducer.Data.CompareFn<T> | null } = { compareFn: null };

   #subscribers: Function[] = [];

   #destroyed: boolean = false;

   /**
    * @param map - Data host Map.
    *
    * @param parentIndex - Parent indexer.
    *
    * @param options - Any filters and sort functions to apply.
    *
    * @typeParam K `unknown` - Key type.
    *
    * @typeParam T `unknown` - Type of data.
    *
    * @private
    */
   constructor(map: Internal.Data.Host<Map<K, T>>, parentIndex: DynReducer.API.Index<K>,
    options: DynReducer.Options.Common<T>)
   {
      this.#map = map;

      this.#index = new MapIndexer(this.#map, this.#updateSubscribers.bind(this), parentIndex);
      this.#indexPublicAPI = new IndexerAPI<K, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived(this.#map, this.#indexPublicAPI, DynMapReducerDerived);
      this.#derivedPublicAPI = new DerivedMapAPI<Map<K, T>, K, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      const { filters, sort } = options;

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
   }

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
    * @returns Returns whether this derived reducer is destroyed.
    */
   get destroyed(): boolean { return this.#destroyed; }

   /**
    * @returns Returns the main data items or indexed items length.
    */
   get length(): number
   {
      const map: Map<K, T> | null | undefined = this.#map?.[0];

      return this.#index.active ? this.index.length :
       map ? map.size : 0;
   }

   /**
    * @returns Returns current reversed state.
    */
   get reversed(): boolean { return this.#index.indexData.reversed; }

   /**
    * @returns Returns the sort adapter.
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
         throw new TypeError(`DerivedMapReducer.reversed error: 'reversed' is not a boolean.`);
      }

      this.#index.indexData.reversed = reversed;

      // Recalculate index and force an update to any subscribers.
      this.index.update({ force: true });
   }

   /**
    * Removes all derived reducers, subscriptions, and cleans up all resources.
    */
   destroy()
   {
      this.#destroyed = true;

      // Remove any external data reference and perform a final update.
      this.#map = [null];
      this.#index.update({ force: true });

      // Remove all subscriptions.
      this.#subscribers.length = 0;

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
   protected initialize(optionsRest?: { [key: string]: any }): void {}

   /**
    * Provides an iterator for data stored in DynMapReducerDerived.
    *
    * @returns Iterator for data stored in DynMapReducerDerived.
    */
   * [Symbol.iterator](): IterableIterator<T>
   {
      const map: Map<K, T> | null = this.#map?.[0] ?? null;

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

// -------------------------------------------------------------------------------------------------------------------

   /**
    * Subscribe to this DerivedMapReducer.
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
}

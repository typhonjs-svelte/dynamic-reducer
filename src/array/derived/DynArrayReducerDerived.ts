import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DerivedAPI,
   DynReducerUtils,
   IndexerAPI }      from '../../common';

import { ArrayIndexer }   from '../ArrayIndexer';

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
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 *
 * Note: That you should never directly create an instance of a derived reducer, but instead use the
 * {@link DynArrayReducerDerived.initialize} callback to set up any initial state in a custom derived reducer.
 *
 * @template T
 */
export class DynArrayReducerDerived<T> implements DynDerivedReducer<T[], number, T>
{
   #array: DynDataHost<T[]>;

   readonly #derived: AdapterDerived<T[], number, T>;

   readonly #derivedPublicAPI: DynDerivedAPI<T[], number, T>;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DynDataFilter<T>[] } = { filters: [] };

   readonly #index: ArrayIndexer<T>;

   readonly #indexPublicAPI: IndexerAPI<number, T>;

   #reversed: boolean = false;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: DynCompareFn<T> } = { compareFn: null };

   #subscriptions: Function[] = [];

   #destroyed = false;

   /**
    * @param {DynDataHost<T[]>}           array - Data host array.
    *
    * @param {DynIndexerAPI<number, T>}  parentIndex - Parent indexer.
    *
    * @param {DynDataOptions<T>}          options - Any filters and sort functions to apply.
    */
   constructor(array: DynDataHost<T[]>, parentIndex: DynIndexerAPI<number, T>, options: DynDataOptions<T>)
   {
      this.#array = array;

      this.#index = new ArrayIndexer(this.#array, this.#updateSubscribers.bind(this), parentIndex);
      this.#indexPublicAPI = new IndexerAPI<number, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived<T[], number, T>(this.#array, this.#indexPublicAPI, DynArrayReducerDerived);
      this.#derivedPublicAPI = new DerivedAPI<T[], number, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      const { filters, sort, ...optionsRest } = options;

      if (filters !== void 0)
      {
         if (!DynReducerUtils.isIterable(filters))
         {
            throw new TypeError(
             `DerivedArrayReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
         }

         this.filters.add(...filters);
      }

      if (sort !== void 0)
      {
         if (typeof sort !== 'function' && (typeof sort !== 'object' || sort === null))
         {
            throw new TypeError(
             `DerivedArrayReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
         }

         this.sort.set(sort);
      }

      // Invoke a custom initialization for child classes.
      this.initialize(optionsRest);
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
    * performed to the data externally do invoke {@link DynIndexerAPI.update} with `true` to recalculate the index and
    * notify all subscribers.
    *
    * @returns The internal data.
    */
   get data(): T[] | null { return this.#array[0]; }

   /**
    * @returns Derived public API.
    */
   get derived(): DynDerivedAPI<T[], number, T> { return this.#derivedPublicAPI; }

   /**
    * @returns The filters adapter.
    */
   get filters(): DynAdapterFilters<T> { return this.#filters; }

   /**
    * Returns the Indexer public API.
    *
    * @returns Indexer API - is also iterable.
    */
   get index(): DynIndexerAPI<number, T> { return this.#indexPublicAPI; }

   /**
    * Returns whether this derived reducer is destroyed.
    */
   get destroyed(): boolean { return this.#destroyed; }

   /**
    * @returns Main data / items length or indexed length.
    */
   get length(): number
   {
      const array = this.#array[0];

      return this.#index.active ? this.index.length :
       array ? array.length : 0;
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
         throw new TypeError(`DerivedArrayReducer.reversed error: 'reversed' is not a boolean.`);
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
      this.#array = [null];
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
    * Provides an iterator for data stored in DerivedArrayReducer.
    *
    * @returns {IterableIterator<T>}
    * @yields {T}
    */
   *[Symbol.iterator](): IterableIterator<T>
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

// -------------------------------------------------------------------------------------------------------------------

   /**
    * Subscribe to this DerivedArrayReducer.
    *
    * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
    *
    * @returns Unsubscribe function.
    */
   subscribe(handler: (value: DynArrayReducerDerived<T>) => void): () => void
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

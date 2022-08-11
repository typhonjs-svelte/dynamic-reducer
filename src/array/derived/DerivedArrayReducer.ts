import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort,
   DerivedAPI,
   DynReducerUtils,
   IndexerAPI }      from '../../common/index.js';

import { Indexer }   from '../Indexer.js';

import type {
   IDerivedReducer,
   CompareFn,
   DataDerivedOptions,
   DataFilter,
   DataHost,
   DataSort,
   FilterFn }        from '../../types/index.js';

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 */
export class DerivedArrayReducer<T> implements IDerivedReducer<T[], number, T>
{
   #array: DataHost<T[]>;

   readonly #derived;

   readonly #derivedPublicAPI;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersData: { filters: DataFilter<T>[] } = { filters: [] };

   readonly #index: Indexer<T>;

   readonly #indexPublicAPI: IndexerAPI<number, T>;

   #reversed: boolean = false;

   readonly #sort: AdapterSort<T>;

   #sortData: { compareFn: CompareFn<T> } = { compareFn: null };

   #subscriptions = [];

   #destroyed = false;

   /**
    * @param array - Data host array.
    *
    * @param parentIndex - Parent indexer.
    *
    * @param options - Any filters and sort functions to apply.
    */
   constructor(array: DataHost<T[]>, parentIndex: IndexerAPI<number, T>, options: DataDerivedOptions<T>)
   {
      this.#array = array;

      this.#index = new Indexer(this.#array, this.#updateSubscribers.bind(this), parentIndex);
      this.#indexPublicAPI = new IndexerAPI<number, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);

      this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DerivedArrayReducer);
      this.#derivedPublicAPI = new DerivedAPI<T[], number, T>(this.#derived);

      this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);

      let filters: Iterable<FilterFn<T>|DataFilter<T>> = void 0;
      let sort: CompareFn<T> | DataSort<T> = void 0;

      if (options !== void 0 && ('filters' in options || 'sort' in options))
      {
         if (options.filters !== void 0)
         {
            if (DynReducerUtils.isIterable(options.filters))
            {
               filters = options.filters;
            }
            else
            {
               throw new TypeError(
                `DerivedArrayReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
            }
         }

         if (options.sort !== void 0)
         {
            if (typeof options.sort === 'function')
            {
               sort = options.sort;
            }
            else if (typeof options.sort === 'object' && options.sort !== null)
            {
               sort = options.sort;
            }
            else
            {
               throw new TypeError(
                `DerivedArrayReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
            }
         }
      }

      // Add any filters and sort function defined by DataDynArray.
      if (filters) { this.filters.add(...filters); }
      if (sort) { this.sort.set(sort); }

      // Invoke an custom initialization for child classes.
      this.initialize();
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
    * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
    * all subscribers.
    *
    * @returns The internal data.
    */
   get data(): T[]|null { return this.#array[0]; }

   /**
    * @returns Derived public API.
    */
   get derived(): DerivedAPI<T[], number, T> { return this.#derivedPublicAPI; }

   /**
    * @returns The filters adapter.
    */
   get filters(): AdapterFilters<T> { return this.#filters; }

   /**
    * Returns the Indexer public API.
    *
    * @returns Indexer API - is also iterable.
    */
   get index(): IndexerAPI<number, T> { return this.#indexPublicAPI; }

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

      // Remove all subscriptions.
      this.#subscriptions.length = 0;

      this.#derived.destroy();
      this.#index.destroy();
      this.#filters.clear();
      this.#sort.clear();

      this.#array = [null];
   }

   /**
    * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
    * child classes to avoid implementing the constructor.
    *
    * @protected
    */
   initialize() {}

   /**
    * Provides an iterator for data stored in DerivedArrayReducer.
    *
    * @returns Generator / iterator of all data.
    */
   *[Symbol.iterator](): Generator<T, T, T>
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
   subscribe(handler: (value: DerivedArrayReducer<T>) => void): () => void
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

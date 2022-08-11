import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort, DerivedAPI,
   IndexerAPI
} from '../../common/index.js';

import { Indexer }      from '../Indexer.js';

import type {
   IDerivedReducer,
   CompareFn,
   DataFilter,
   DataHost
} from "../../types.js";

/**
 */
export class DerivedArrayReducer<T> implements IDerivedReducer<T[], number, T>
{
   readonly #array: DataHost<T[]>;

   readonly #derived;

   readonly #derivedPublicAPI;

   readonly #filters: AdapterFilters<T>;

   readonly #filtersAdapter: { filters: DataFilter<T>[] } = { filters: [] };

   readonly #index: Indexer<T>;

   readonly #indexPublicAPI: IndexerAPI<number, T>;

   #reversed: boolean = false;

   readonly #sort: AdapterSort<T>;

   #sortAdapter: { compareFn: CompareFn<T> } = { compareFn: null };

   #subscriptions = [];

   /**
    *
    * @param array - Data host array.
    *
    * @param parentIndex - Parent indexer.
    *
    * @param options -
    */
   constructor(array: DataHost<T[]>, parentIndex: IndexerAPI<number, T>, options: object)
   {
      this.#array = array;

      this.#index = new Indexer(this.#array, this.#updateSubscribers.bind(this), parentIndex);
      this.#indexPublicAPI = new IndexerAPI<number, T>(this.#index);

      this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersAdapter);

      this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortAdapter);

      this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DerivedArrayReducer);
      this.#derivedPublicAPI = new DerivedAPI<T[], number, T>(this.#derived);

      this.#index.initAdapters(this.#filtersAdapter, this.#sortAdapter, this.#derived);

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
    * @returns Main data / items length or indexed length.
    */
   get length(): number
   {
      const array = this.#array[0];

      return this.#index.isActive ? this.index.length :
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

      if (array === null || array?.length === 0) { return; }

      if (this.#index.isActive)
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
    *
    */
   #updateSubscribers()
   {
      for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) { this.#subscriptions[cntr](this); }
   }
}

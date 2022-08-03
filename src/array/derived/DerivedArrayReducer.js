import {
   AdapterDerived,
   AdapterFilters,
   AdapterSort
} from '#common';

import { Indexer }   from '../Indexer.js';

/**
 * @template T
 */
export class DerivedArrayReducer
{
   /**
    * @type {DataHost<T[]>}
    */
   #array;

   #derived;

   #derivedPublicAPI;

   /**
    * @type {AdapterFilters<T>}
    */
   #filters;

   /**
    * @type {{filters: FilterFn<T>[]}}
    */
   #filtersAdapter;

   /**
    * @type {Indexer}
    */
   #index;

   /**
    * @type {APIIndexer<number>}
    */
   #indexPublicAPI;

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
    *
    * @param {DataHost<T[]>}     array - Data host array.
    *
    * @param {Indexer<T>} parentIndex - Parent indexer.
    *
    * TODO: fix type
    *
    * @param {object}            options -
    */
   constructor(array, parentIndex, options)
   {
      this.#array = array;

      [this.#index, this.#indexPublicAPI] = new Indexer(array, this.#updateSubscribers.bind(this), parentIndex);
      [this.#filters, this.#filtersAdapter] = new AdapterFilters(this.#indexPublicAPI.update);
      [this.#sort, this.#sortAdapter] = new AdapterSort(this.#indexPublicAPI.update);
      [this.#derived, this.#derivedPublicAPI] = new AdapterDerived(this.#array, this.#index, DerivedArrayReducer);

      this.#index.initAdapters(this.#filtersAdapter, this.#sortAdapter, this.#derived);
   }

   /**
    * Returns the internal data of this instance. Be careful!
    *
    * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
    * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
    * all subscribers.
    *
    * @returns {T[]|null} The internal data.
    */
   get data() { return this.#array[0]; }

   /**
    * @returns {AdapterFilters<T>} The filters adapter.
    */
   get filters() { return this.#filters; }

   /**
    * Returns the Indexer public API.
    *
    * @returns {APIIndexer<number>} Indexer API - is also iterable.
    */
   get index() { return this.#indexPublicAPI; }

   /**
    * Gets the main data / items length.
    *
    * @returns {number} Main data / items length.
    */
   get length()
   {
      const parentIndexer = this.#index.indexData?.parent;
      return this.#index.isActive() ? this.index.length :
       parentIndexer ? parentIndexer.length : 0;
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
         throw new TypeError(`DerivedArrayReducer.reversed error: 'reversed' is not a boolean.`);
      }

      this.#reversed = reversed;
      this.#index.reversed = reversed;

      // Recalculate index and force an update to any subscribers.
      this.index.update(true);
   }

   /**
    * Provides an iterator for data stored in DynArrayReducer.
    *
    * @returns {Generator<*, T, *>} Generator / iterator of all data.
    * @yields {T}
    */
   *[Symbol.iterator]()
   {
      const array = this.#array[0];

      if (array === null || array?.length === 0) { return; }

      if (this.#index.isActive())
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
    * @param {function(DerivedArrayReducer<T>): void} handler - Callback function that is invoked on update / changes.
    *                                                           Receives `this` reference.
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
}

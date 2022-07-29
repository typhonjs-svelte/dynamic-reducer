import {
   AdapterFilters,
   AdapterSort }     from '#common';

import { Indexer }   from "../Indexer.js";

/**
 * @template T
 */
export class DerivedArrayReducer
{
   /**
    * @type {DataHost<T[]>}
    */
   #array;

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
    * @type {IndexerAPI<number>}
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
    * @param {AdapterIndexer<T>} parentIndex - Parent indexer.
    */
   constructor(array, parentIndex)
   {
      this.#array = array;

      [this.#index, this.#indexPublicAPI] = new Indexer(array, this.#updateSubscribers.bind(this), parentIndex);
      [this.#filters, this.#filtersAdapter] = new AdapterFilters(this.#indexPublicAPI.update);
      [this.#sort, this.#sortAdapter] = new AdapterSort(this.#indexPublicAPI.update);
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
    * @returns {IndexerAPI<number>} Indexer API - is also iterable.
    */
   get index() { return this.#indexPublicAPI; }

   /**
    * Gets the main data / items length.
    *
    * @returns {number} Main data / items length.
    */
   get length()
   {
      const array = this.#array[0];
      return this.#index.isActive() ? this.index.length :
       array ? array.length : 0;
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
         throw new TypeError(`DynArrayReducer.reversed error: 'reversed' is not a boolean.`);
      }

      this.#reversed = reversed;
      this.#index.reversed = reversed;

      // Recalculate index and force an update to any subscribers.
      this.index.update(true);
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

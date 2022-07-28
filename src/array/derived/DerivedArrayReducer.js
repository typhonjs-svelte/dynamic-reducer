import {
   AdapterFilters,
   AdapterSort }     from '#common';

import { Indexer }   from "../Indexer.js";

/**
 * @template T
 */
export class DerivedArrayReducer
{
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
    * @type{IndexerAPI}
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

   constructor(array)
   {
      this.#array = array;

      [this.#index, this.#indexPublicAPI] = new Indexer(array, this.#updateSubscribers.bind(this));
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
}

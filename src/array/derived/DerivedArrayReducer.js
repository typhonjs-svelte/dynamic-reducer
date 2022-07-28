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
}

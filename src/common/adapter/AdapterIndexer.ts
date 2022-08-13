import { DynReducerUtils }       from '../DynReducerUtils.js';

import type { IndexerAPI }       from '../api/IndexerAPI.js';

import type {
   CompareFn,
   DataFilter,
   DataHost,
   DataIndexer }                 from '../../types/index.js';

import type { AdapterDerived }   from './AdapterDerived.js';

/**
 * Provides construction and management of indexed data when there are parent indexes or filter / sort functions
 * applied.
 */
export abstract class AdapterIndexer<D, K, T>
{
   public derivedAdapter: AdapterDerived<D, K, T>

   public filtersData: { filters: DataFilter<T>[] };

   public hostData: DataHost<D>;

   public hostUpdate: Function;

   public indexData: DataIndexer<K, T>;

   public sortData: { compareFn: CompareFn<T> };

   public sortFn: (a: K, b: K) => number;

   public destroyed = false;

   /**
    * @param hostData - Hosted data structure.
    *
    * @param hostUpdate - Host update function invoked on index updates.
    *
    * @param [parentIndexer] - Any associated parent index API.
    *
    * @returns Indexer adapter instance.
    */
   constructor(hostData: DataHost<D>, hostUpdate: Function, parentIndexer?: IndexerAPI<K, T>)
   {
      this.hostData = hostData;

      this.hostUpdate = hostUpdate;

      this.indexData = { index: null, hash: null, reversed: false, parent: parentIndexer };
   }

   /**
    * @returns Returns whether the index is active.
    */
   get active(): boolean
   {
      return this.filtersData.filters.length > 0 || this.sortData.compareFn !== null ||
       this.indexData.parent?.active === true;
   }

   /**
    * @returns Returns length of reduced index.
    */
   get length(): number
   {
      return this.indexData.index ? this.indexData.index.length : 0;
   }

   /* c8 ignore start */
   /**
    * @returns Returns reversed state.
    */
   get reversed(): boolean { return this.indexData.reversed; }
   /* c8 ignore end */

   /**
    * @param reversed - New reversed state.
    */
   set reversed(reversed: boolean) { this.indexData.reversed = reversed; }

// -------------------------------------------------------------------------------------------------------------------

   /**
    * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
    * is set to null. Set calculated new hash value to the index adapter hash value.
    *
    * After hash generation compare old and new hash values and perform an update if they are different. If they are
    * equal check for array equality between the old and new index array and perform an update if they are not equal.
    *
    * @param oldIndex - Old index array.
    *
    * @param oldHash - Old index hash value.
    *
    * @param [force=false] - When true forces an update to subscribers.
    */
   calcHashUpdate(oldIndex: K[], oldHash: number | null, force: boolean = false)
   {
      // Use force if a boolean otherwise default to false.
      const actualForce = typeof force === 'boolean' ? force : /* c8 ignore next */ false;

      let newHash = null;
      const newIndex = this.indexData.index;

      if (newIndex)
      {
         for (let cntr: number = newIndex.length; --cntr >= 0;)
         {
            newHash ^= DynReducerUtils.hashUnknown(newIndex[cntr]) + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
         }
      }

      this.indexData.hash = newHash;

      if (actualForce || (oldHash === newHash ? !DynReducerUtils.arrayEquals(oldIndex, newIndex) : true))
      {
         this.hostUpdate();
      }
   }

   /**
    * @returns Sort function adapting host data.
    */
   abstract createSortFn(): (a: K, b: K) => number;

   /**
    * Destroys all resources.
    */
   destroy()
   {
      if (this.destroyed) { return; }

      this.indexData.index = null;
      this.indexData.hash = null;
      this.indexData.reversed = null;
      this.indexData.parent = null;

      this.destroyed = true;
   }

   /**
    * Store associated filter and sort data that are constructed after the indexer.
    *
    * @param filtersData - Associated AdapterFilters instance.
    *
    * @param sortData - Associated AdapterSort instance.
    *
    * @param derivedAdapter - Associated AdapterDerived instance.
    */
   initAdapters(filtersData: { filters: DataFilter<T>[] }, sortData: { compareFn: CompareFn<T> },
    derivedAdapter: AdapterDerived<D, K, T>)
   {
      this.filtersData = filtersData;

      this.sortData = sortData;

      this.derivedAdapter = derivedAdapter;

      this.sortFn = this.createSortFn();
   }

   /**
    * Handles updating the index in child implementation specific to the backing data structure.
    *
    * @param [force] - Force an update to any subscribers.
    */
   abstract update(force: boolean): void;
}

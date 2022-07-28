import { DynReducerUtils } from '../DynReducerUtils.js';

/**
 * @template T
 */
export class AdapterIndexer
{
   /**
    *
    * @param hostData
    *
    * @param {Function}          hostUpdate -
    *
    * @param {AdapterIndexer<T>} parentIndexer -
    *
    * @returns {[AdapterIndexer<T>, IndexerAPI<number>]}
    */
   constructor(hostData, hostUpdate, parentIndexer)
   {
      this.hostData = hostData;
      this.hostUpdate = hostUpdate;

      const indexData = { index: null, hash: null, reversed: false, parent: parentIndexer };

      let publicAPI = {
         update: this.update.bind(this),

         /**
          * Provides an iterator over the index array.
          *
          * @returns {Generator<any, void, *>} Iterator.
          * @yields
          */
         [Symbol.iterator]: function *()
         {
            if (!indexData.index) { return; }

            const reversed = indexData.reversed;
            const length = indexData.index.length;

            if (reversed)
            {
               for (let cntr = length; --cntr >= 0;) { yield indexData.index[cntr]; }
            }
            else
            {
               for (let cntr = 0; cntr < length; cntr++) { yield indexData.index[cntr]; }
            }
         }
      };

      // Defines getters on the public API to get the index hash, isActive state, and index length.
      Object.defineProperties(publicAPI, {
         hash: { get: () => indexData.hash },
         isActive: { get: () => this.isActive() },
         length: { get: () => Array.isArray(indexData.index) ? indexData.index.length : 0 }
      });

      publicAPI = this.initializePublicAPI(publicAPI, indexData);

      Object.freeze(publicAPI);

      this.indexData = indexData;

      return [this, publicAPI];
   }

   /* c8 ignore next */
   /**
    * @returns {boolean}
    *
    * c8 ignore next
    */
   get reversed() { return this.indexData.reversed; }

   /**
    *
    * @param {boolean}  reversed -
    */
   set reversed(reversed) { this.indexData.reversed = reversed; }

   /**
    * Allows additions to public API.
    *
    * @param publicAPI
    *
    * @param indexData
    *
    * @returns {*}
    */
   initializePublicAPI(publicAPI, indexData) { return publicAPI; }

// -------------------------------------------------------------------------------------------------------------------

   /**
    * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
    * is set to null. Set calculated new hash value to the index adapter hash value.
    *
    * After hash generation compare old and new hash values and perform an update if they are different. If they are
    * equal check for array equality between the old and new index array and perform an update if they are not equal.
    *
    * @param {number[]}    oldIndex - Old index array.
    *
    * @param {number|null} oldHash - Old index hash value.
    *
    * @param {boolean}     [force=false] - When true forces an update to subscribers.
    */
   calcHashUpdate(oldIndex, oldHash, force = false)
   {
      // Use force if a boolean otherwise default to false.
      const actualForce = typeof force === 'boolean' ? force : /* c8 ignore next */ false;

      let newHash = null;
      const newIndex = this.indexData.index;

      if (newIndex)
      {
         for (let cntr = newIndex.length; --cntr >= 0;)
         {
            newHash ^= newIndex[cntr] + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
         }
      }

      this.indexData.hash = newHash;

      if (actualForce || (oldHash === newHash ? !DynReducerUtils.arrayEquals(oldIndex, newIndex) : true))
      {
         this.hostUpdate();
      }
   }

   /**
    * Store associated filter and sort adapters that are constructed after the indexer.
    *
    * @param {AdapterFilters<T>} filtersAdapter - Associated AdapterFilters instance.
    *
    * @param {AdapterSort<T>}    sortAdapter - Associated AdapterSort instance.
    */
   initAdapters(filtersAdapter, sortAdapter)
   {
      /** @type {AdapterFilters<T>} */
      this.filtersAdapter = filtersAdapter;

      /** @type {AdapterSort<T>} */
      this.sortAdapter = sortAdapter;
   }

   /**
    * Returns whether the index is active.
    *
    * @returns {boolean} Index active.
    */
   isActive()
   {
      return this.filtersAdapter.filters.length > 0 || this.sortAdapter.compareFn !== null;
   }
}

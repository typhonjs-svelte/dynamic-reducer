export class Indexer
{
   constructor(hostArray, hostUpdate)
   {
      this.hostArray = hostArray;
      this.hostUpdate = hostUpdate;

      const indexData = { index: null, hash: null, reversed: false };

      const publicAPI = {
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

      // Define a getter on the public API to get the length / count of index array.
      Object.defineProperties(publicAPI, {
         hash: { get: () => indexData.hash },
         isActive: { get: () => this.isActive() },
         length: { get: () => Array.isArray(indexData.index) ? indexData.index.length : 0 }
      });

      Object.freeze(publicAPI);

      this.indexData = indexData;

      return [this, publicAPI];
   }

   /* c8 ignore next */
   get reversed() { return this.indexData.reversed; }

   set reversed(reversed) { this.indexData.reversed = reversed; }

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

      if (actualForce || (oldHash === newHash ? !s_ARRAY_EQUALS(oldIndex, newIndex) : true)) { this.hostUpdate(); }
   }

   initAdapters(filtersAdapter, sortAdapter)
   {
      this.filtersAdapter = filtersAdapter;
      this.sortAdapter = sortAdapter;

      this.sortFn = (a, b) =>
      {
         return this.sortAdapter.compareFn(this.hostArray[0][a], this.hostArray[0][b]);
      };
   }

   isActive()
   {
      return this.filtersAdapter.filters.length > 0 || this.sortAdapter.compareFn !== null;
   }

   /**
    * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
    *
    * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
    * but the maintenance factor is not worth the extra complication.
    *
    * @returns {number[]} New filtered index array.
    */
   reduceImpl()
   {
      const data = [];

      const array = this.hostArray[0];
      if (!array) { return data; }

      const filters = this.filtersAdapter.filters;

      let include = true;

      for (let cntr = 0, length = array.length; cntr < length; cntr++)
      {
         include = true;

         for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++)
         {
            if (!filters[filCntr].filter(array[cntr]))
            {
               include = false;
               break;
            }
         }

         if (include) { data.push(cntr); }
      }

      return data;
   }

   /**
    * Update the reducer indexes. If there are changes subscribers are notified. If data order is changed externally
    * pass in true to force an update to subscribers.
    *
    * @param {boolean}  [force=false] - When true forces an update to subscribers.
    */
   update(force = false)
   {
      const oldIndex = this.indexData.index;
      const oldHash = this.indexData.hash;

      const array = this.hostArray[0];

      // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
      if ((this.filtersAdapter.filters.length === 0 && !this.sortAdapter.compareFn) ||
       (this.indexData.index && array?.length !== this.indexData.index.length))
      {
         this.indexData.index = null;
      }

      // If there are filters build new index.
      if (this.filtersAdapter.filters.length > 0) { this.indexData.index = this.reduceImpl(); }

      if (this.sortAdapter.compareFn && Array.isArray(array))
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexData.index) { this.indexData.index = [...Array(array.length).keys()]; }

         this.indexData.index.sort(this.sortFn);
      }

      this.calcHashUpdate(oldIndex, oldHash, force);
   }
}

/**
 * Checks for array equality between two arrays of numbers.
 *
 * @param {number[]} a - Array A
 *
 * @param {number[]} b - Array B
 *
 * @returns {boolean} Arrays equal
 */
function s_ARRAY_EQUALS(a, b)
{
   if (a === b) { return true; }
   if (a === null || b === null) { return false; }

   /* c8 ignore next */
   if (a.length !== b.length) { return false; }

   for (let cntr = a.length; --cntr >= 0;)
   {
      /* c8 ignore next */
      if (a[cntr] !== b[cntr]) { return false; }
   }

   return true;
}

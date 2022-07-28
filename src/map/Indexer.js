import { AdapterIndexer } from '../common/AdapterIndexer.js';

export class Indexer extends AdapterIndexer
{
   initAdapters(filtersAdapter, sortAdapter)
   {
      super.initAdapters(filtersAdapter, sortAdapter);

      this.sortFn = (a, b) =>this.sortAdapter.compareFn(this.hostData[0].get(a), this.hostData[0].get(b));
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

      const map = this.hostData[0];
      if (!map) { return data; }

      const filters = this.filtersAdapter.filters;

      let include = true;

      for (const key of map.keys())
      {
         include = true;

         const value = map.get(key);

         for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++)
         {
            if (!filters[filCntr].filter(value))
            {
               include = false;
               break;
            }
         }

         if (include) { data.push(key); }
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

      const map = this.hostData[0];

      // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
      if ((this.filtersAdapter.filters.length === 0 && !this.sortAdapter.compareFn) ||
       (this.indexData.index && map?.size !== this.indexData.index.length))
      {
         this.indexData.index = null;
      }

      // If there are filters build new index.
      if (this.filtersAdapter.filters.length > 0) { this.indexData.index = this.reduceImpl(); }

      if (this.sortAdapter.compareFn && map instanceof Map)
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexData.index) { this.indexData.index = [...map.keys()]; }

         this.indexData.index.sort(this.sortFn);
      }

      this.calcHashUpdate(oldIndex, oldHash, force);
   }
}

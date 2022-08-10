import {
   AdapterIndexer,
   DynReducerUtils } from '../common/index.js';

/**
 */
export class Indexer<T> extends AdapterIndexer<T[], number, T>
{
   /**
    * @inheritDoc
    */
   createSortFn(): (a: number, b: number) => number
   {
      return (a, b) => this.sortData.compareFn(this.hostData[0][a], this.hostData[0][b]);
   }

   /**
    * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
    *
    * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
    * but the maintenance factor is not worth the extra complication.
    *
    * @returns New filtered index array.
    */
   reduceImpl(): number[]
   {
      const data = [];

      const array = this.hostData[0];
      if (!array) { return data; }

      const filters = this.filtersData.filters;

      let include = true;

      const parentIndex = this.indexData.parent;

      if (DynReducerUtils.isIterable(parentIndex) && parentIndex.isActive)
      {
         for (const adjustedIndex of parentIndex)
         {
            const value = array[adjustedIndex];
            include = true;

            for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++)
            {
               if (!filters[filCntr].filter(value))
               {
                  include = false;
                  break;
               }
            }

            if (include) { data.push(adjustedIndex); }
         }
      }
      else
      {
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
      }

      return data;
   }

   /**
    * Update the reducer indexes. If there are changes subscribers are notified. If data order is changed externally
    * pass in true to force an update to subscribers.
    *
    * @param [force=false] - When true forces an update to subscribers.
    */
   update(force: boolean = false)
   {
      const oldIndex = this.indexData.index;
      const oldHash = this.indexData.hash;

      const array = this.hostData[0];

      // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
      if ((this.filtersData.filters.length === 0 && !this.sortData.compareFn) ||
       (this.indexData.index && array?.length !== this.indexData.index.length))
      {
         this.indexData.index = null;
      }

      // If there are filters build new index.
      if (this.filtersData.filters.length > 0) { this.indexData.index = this.reduceImpl(); }

      if (this.sortData.compareFn && Array.isArray(array))
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexData.index) { this.indexData.index = [...Array(array.length).keys()]; }

         this.indexData.index.sort(this.sortFn);
      }

      this.calcHashUpdate(oldIndex, oldHash, force);

      // Update all derived reducers.
      this.derivedAdapter?.update(force);
   }
}

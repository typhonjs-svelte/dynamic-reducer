import {
   AdapterIndexer,
   DynReducerUtils }       from '#common';

import type { DynReducer } from '../types';

/**
 */
export class ArrayIndexer<T> extends AdapterIndexer<T[], number, T>
{
   /**
    * @inheritDoc
    */
   createSortFn(): (a: number, b: number) => number
   {
      return (a: number, b: number): number =>
      {
         const data: T[] | null | undefined = this.hostData?.[0];
         const dataA: T | undefined = data?.[a];
         const dataB: T | undefined = data?.[b];
         /* c8 ignore next */
         return dataA !== void 0 && dataB !== void 0 ? this.sortData.compareFn!(dataA, dataB) : 0;
      }
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
      const data: number[] = [];

      const array: T[] | null | undefined = this.hostData?.[0];
      if (!array) { return data; }

      const filters: DynReducer.Data.Filter<T>[] = this.filtersData.filters;

      let include: boolean = true;

      const parentIndex: DynReducer.API.Index<number> | null | undefined = this.indexData.parent;

      // Source index data is coming from an active parent index.
      if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active)
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
    * @param [options] - Optional settings or any arbitrary value.
    *
    * @param [options.force=false] - Force an update the index regardless of hash calculations.
    *
    * @param [options.reversed] - Potentially change reversed state.
    */
   update(options?: unknown | { force?: boolean, reversed?: boolean })
   {
      if (this.destroyed) { return; }

      let { force = false, reversed = void 0 } = (typeof options === 'object' && options !== null ? options : {}) as {
         force?: boolean;
         reversed?: boolean;
      };

      if (typeof reversed === 'boolean' && this.indexData.reversed !== reversed)
      {
         force = true;
         this.indexData.reversed = reversed;
      }

      const oldIndex: number[] | null = this.indexData.index;
      const oldHash: number | null = this.indexData.hash;

      const array: T[] | null | undefined = this.hostData?.[0];
      const parentIndex: DynReducer.API.Index<number> | null | undefined = this.indexData.parent;

      // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
      if ((this.filtersData.filters.length === 0 && !this.sortData.compareFn) ||
       (this.indexData.index && array?.length !== this.indexData.index.length))
      {
         this.indexData.index = null;
      }

      // If there are filters build new index.
      if (this.filtersData.filters.length > 0)
      {
         this.indexData.index = this.reduceImpl();
      }

      // If the index isn't built yet and there is an active parent index then create it from the parent.
      if (!this.indexData.index && parentIndex?.active)
      {
         this.indexData.index = [...parentIndex];
      }

      if (this.sortData.compareFn && Array.isArray(array))
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexData.index)
         {
            this.indexData.index = [...Array(array.length).keys()];
         }

         this.indexData.index.sort(this.sortFn);
      }

      this.calcHashUpdate(oldIndex, oldHash, force);

      // Update all derived reducers.
      this.derivedAdapter?.update(options);
   }
}

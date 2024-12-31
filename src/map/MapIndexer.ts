import {
   AdapterIndexer,
   DynReducerUtils } from '../common';
import {DynReducer} from "#package";

/**
 */
export class MapIndexer<K, T> extends AdapterIndexer<Map<K, T>, K, T>
{
   /**
    * @inheritDoc
    */
   createSortFn(): (a: K, b: K) => number
   {
      return (a, b) =>
      {
         const data: Map<K, T> | null | undefined = this.hostData?.[0];
         const dataA: T | undefined = data?.get(a);
         const dataB: T | undefined = data?.get(b);

         /* c8 ignore next */
         return dataA && dataB ? this.sortData.compareFn!(dataA, dataB) : 0;
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
   reduceImpl(): K[]
   {
      const data: K[] = [];

      const map: Map<K, T> | null | undefined = this.hostData?.[0];
      if (!map) { return data; }

      const filters: DynReducer.Data.Filter<T>[] = this.filtersData.filters;

      let include: boolean = true;

      const parentIndex: DynReducer.API.Index<K, T> | null | undefined = this.indexData.parent;

      // Source index data is coming from an active parent index.
      if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active)
      {
         for (const key of parentIndex)
         {
            const value: T | undefined = map.get(key);
            include = true;

            /* c8 ignore next */
            if (value === undefined) { continue; }

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
      }
      else
      {
         for (const key of map.keys())
         {
            include = true;

            const value: T | undefined = map.get(key);

            /* c8 ignore next */
            if (value === void 0) { continue; }

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
      if (this.destroyed) { return; }

      const oldIndex: K[] | null = this.indexData.index;
      const oldHash: number | null = this.indexData.hash;

      const map: Map<K, T> | null | undefined = this.hostData?.[0];
      const parentIndex: DynReducer.API.Index<K, T> | null | undefined = this.indexData.parent;

      // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
      if ((this.filtersData.filters.length === 0 && !this.sortData.compareFn) ||
       (this.indexData.index && map?.size !== this.indexData.index.length))
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

      if (this.sortData.compareFn && map instanceof Map)
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexData.index) { this.indexData.index = [...map.keys()]; }

         this.indexData.index.sort(this.sortFn);
      }

      this.calcHashUpdate(oldIndex, oldHash, force);

      // Update all derived reducers.
      this.derivedAdapter?.update(force);
   }
}

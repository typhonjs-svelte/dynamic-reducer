import type { AdapterIndexer }   from '../adapter/AdapterIndexer';

import type { DynReducer }       from '../../types';
import type { Internal }         from '../../types/internal';

export class IndexerAPI<K, T> implements DynReducer.API.Index<K, T>
{
   readonly #indexData: Internal.Data.Index<K, T>

   /**
    * Provides a getter to determine if the index is active.
    */
   readonly active: boolean;

   /**
    * Provides length of reduced / indexed elements.
    */
   readonly length: number;

   /**
    * Manually invoke an update of the index.
    *
    * @param force - Force update to any subscribers.
    */
   readonly update: (force?: boolean) => void;

   constructor(adapterIndexer: AdapterIndexer<any, K, T>)
   {
      this.#indexData = adapterIndexer.indexData;

      this.update = adapterIndexer.update.bind(adapterIndexer);

      // Defines getters on the public API to get the index hash, active state, and index length.
      Object.defineProperties(this, {
         active: {get: () => adapterIndexer.active},
         length: {get: () => adapterIndexer.length}
      });

      Object.freeze(this);
   }

   get hash(): number | null
   {
      return this.#indexData.hash;
   }

   * [Symbol.iterator](): IterableIterator<K>
   {
      const indexData = this.#indexData;

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
}

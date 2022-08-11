import type { AdapterIndexer }  from '../../common/adapter/AdapterIndexer.js';
import type { DataIndexer }     from '../../types/index.js';

/**
 * Provides the public API for accessing the index API.
 *
 * This class forms the public API which is accessible from the `.index` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.index.hash;
 * dynArray.index.isActive;
 * dynArray.index.length;
 * dynArray.index.update(...);
 * ```
 */
export class IndexerAPI<K, T>
{
    readonly #indexData: DataIndexer<K, T>

    /**
     * Provides a getter to determine if the index is active.
     */
    readonly isActive: boolean;

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

        // Defines getters on the public API to get the index hash, isActive state, and index length.
        Object.defineProperties(this, {
           isActive: { get: () => adapterIndexer.isActive },
           length: { get: () => adapterIndexer.length }
        });

        Object.freeze(this);
    }

    /**
     * - Current hash value of the index.
     */
    get hash(): number | null
    {
        return this.#indexData.hash;
    }

    /**
     * Provides an iterator over the index array.
     *
     * @returns Iterator / generator
     * @yields {K}
     */
    *[Symbol.iterator](): Generator<K, K, K>
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

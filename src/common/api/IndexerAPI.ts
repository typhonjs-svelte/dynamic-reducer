import type { AdapterIndexer }  from '../../common/adapter/AdapterIndexer.js';
import type { DataIndexer }     from '../../types/index.js';

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

        Object.seal(this);
    }

    /**
     * - Current hash value of the index.
     */
    get hash(): number | null
    {
        return this.#indexData.hash;
    }

    /**
     * @returns Returns length of reduced / indexed elements.
     */
//     get length(): number
//     {
// console.log(`! IndexerAPI - length - 0 - Array.isArray(this.#indexData.index): `, Array.isArray(this.#indexData.index))
// console.log(`! IndexerAPI - length - 1 - this.#indexData.index.length: `, this.#indexData.index?.length)
//         return Array.isArray(this.#indexData.index) ? this.#indexData.index.length : 0
//     }

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

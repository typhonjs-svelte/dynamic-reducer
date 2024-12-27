import type {
   DynAdapterFilters,
   DynAdapterSort,
   DynDerivedAPI,
   DynIndexerAPI,

   DynArrayData,
   DynMapData,
   DynDataHost,
   DynDataOptions, DynDataFilter
} from './';

import type { DynMapReducer }   from '../map';
import type { DynArrayReducer } from '../array';

/**
 * Defines the shape of a dynamic array constructor function.
 */
export interface DynArrayReducerCtor<T>
{
    new (data?: Iterable<T> | DynArrayData<T>): DynArrayReducer<T>;
}

/**
 * Defines the shape of a dynamic map constructor function.
 */
export interface DynMapReducerCtor<K, T>
{
    new (data?: Map<K, T> | DynMapData<K, T>): DynMapReducer<K, T>;
}

/**
 * Defines the shape of a derived reducer constructor function.
 */
export interface DynDerivedReducerCtor<T>
{
    new (hostData: DynDataHost<any>, parentIndex: DynIndexerAPI<any, T>, options: DynDataOptions<T>): DynDerivedReducer<any, any, T>;
}

/**
 * Defines the interface for a derived reducer.
 */
export interface DynDerivedReducer<D, K, T>
{
   /**
    * @returns Provides an iterator for data stored in DynDerivedReducer.
    */
   [Symbol.iterator](): IterableIterator<T>;

    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke `update` via {@link DynDerivedReducer.index} with `true` to
     * recalculate the index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): D | null;

    /**
     * @returns Derived public API.
     */
    get derived(): DynDerivedAPI<D, K, T>

    /**
     * @returns The filters adapter.
     */
    get filters(): DynAdapterFilters<T>;

    /**
     * @returns Returns the Indexer public API.
     */
    get index(): DynIndexerAPI<K, T>;

    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;

    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;

    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;

    /**
     * @returns The sort adapter.
     */
    get sort(): DynAdapterSort<T>;

    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);

    /**
     * Removes all derived reducers, subscriptions, and cleans up all resources.
     */
    destroy(): void;

    /**
     * Subscribe to this IDerivedReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives derived reducer reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynDerivedReducer<D, K, T>) => void): () => void;
}
